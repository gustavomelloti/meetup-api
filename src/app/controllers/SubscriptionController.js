import { Op } from 'sequelize';
import { isBefore } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

import Mail from '../../lib/Mail';

import Messages from '../constants/Messages';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          model: Meetup,
          required: true,
          include: [
            {
              model: File,
              as: 'banner',
            },
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
      order: [[Meetup, 'date', 'DESC']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (!meetup)
      return res.status(400).json({ error: Messages.MessagesMeetupNotFound });

    if (meetup.user_id === req.userId)
      return res
        .status(400)
        .json({ error: Messages.MessagesNotSubscribeInYoursMeetups });

    if (isBefore(meetup.date, new Date()))
      return res.status(400).json({
        error: Messages.MessagesSubscribeInPastMeetup,
      });

    const checkSubscription = await Subscription.findOne({
      where: {
        user_id: req.userId,
        meetup_id: req.params.meetupId,
      },
    });

    if (checkSubscription)
      return res
        .status(400)
        .json({ error: Messages.MessagesSubscribeInMeetup });

    const checkDate = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          where: { date: meetup.date },
          model: Meetup,
          required: true,
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: Messages.MessagesMeetupInSameDate,
      });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetup.id,
    });

    const responsible = await User.findByPk(meetup.user_id);

    await Mail.sendMail({
      to: `${responsible.name} <${responsible.email}>`,
      subject: 'Nova inscrição!',
      html: `Olá, ${responsible.name}! Você tem mais um participante no Meetup ${meetup.title}.`,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    const { meetupId } = req.params;
    const { userId } = req;

    const subscription = await Subscription.findOne({
      where: { meetup_id: meetupId, user_id: userId },
    });

    if (!subscription)
      return res
        .status(400)
        .json({ error: Messages.MessagesSubscriptionsNotFound });

    await subscription.destroy();

    return res.json();
  }
}

export default new SubscriptionController();
