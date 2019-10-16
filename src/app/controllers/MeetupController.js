import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

import Messages from '../constants/Messages';

class MeetupController {
  async index(req, res) {
    const page = req.query.page || 1;

    const searchFormattedDate = req.query.date
      ? parseISO(req.query.date)
      : null;

    const meetups = await Meetup.findAll({
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: File,
          as: 'banner',
        },
      ],
      limit: 10,
      offset: 10 * page - 10,
      where: req.query.date
        ? {
            date: {
              [Op.between]: [
                startOfDay(searchFormattedDate),
                endOfDay(searchFormattedDate),
              ],
            },
          }
        : {},
    });

    return res.json(meetups);
  }

  async store(req, res) {
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: Messages.MessagesDateMoreThanCurrent });
    }

    const file = await File.findByPk(req.body.banner_id);
    if (!file)
      return res.status(400).json({ error: Messages.MessagesBannerNotFound });

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: Messages.MessagesDateMoreThanCurrent });
    }

    const file = await File.findByPk(req.body.banner_id);
    if (!file)
      return res.status(400).json({ error: Messages.MessagesBannerNotFound });

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup)
      return res.status(400).json({ error: Messages.MessagesMeetupNotFound });

    const { userId } = req;

    if (meetup.user_id !== userId)
      return res
        .status(400)
        .json({ error: Messages.MessagesMeetupWithoutPermissionToUpdate });

    if (isBefore(meetup.date, new Date()))
      return res.status(400).json({ error: Messages.MessagesUpdatePastMeetup });

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup)
      return res.status(400).json({ error: Messages.MessagesMeetupNotFound });

    const { userId } = req;

    if (meetup.user_id !== userId)
      return res
        .status(400)
        .json({ error: Messages.MessagesMeetupWithoutPermissionToDelete });

    if (isBefore(meetup.date, new Date()))
      return res.status(400).json({ error: Messages.MessagesDeletePastMeetup });

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
