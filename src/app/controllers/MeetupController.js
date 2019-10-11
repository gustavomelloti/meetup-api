import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const page = req.query.page || 1;

    const searchFormattedDate = req.query.date
      ? parseISO(req.query.date)
      : null;

    const meetups = await Meetup.findAll({
      include: [User],
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
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      banner_id: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro nos dados informados.' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Informe uma data maior do que a atual.' });
    }

    const file = await File.findByPk(req.body.banner_id);
    if (!file) return res.status(400).json({ error: 'Banner não encontrado.' });

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      banner_id: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Erro nos dados informados.' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'Informe uma data maior do que a atual.' });
    }

    const file = await File.findByPk(req.body.banner_id);
    if (!file) return res.status(400).json({ error: 'Banner não encontrado.' });

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup)
      return res.status(400).json({ error: 'Meetup não encontrado.' });

    const { userId } = req;

    if (meetup.user_id !== userId)
      return res
        .status(400)
        .json({ error: 'Você não possui permissão para deletar este Meetup.' });

    if (isBefore(meetup.date, new Date()))
      return res
        .status(400)
        .json({ error: 'Você não pode editar Meetups que já aconteceram.' });

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup)
      return res.status(400).json({ error: 'Meetup não encontrado.' });

    const { userId } = req;

    if (meetup.user_id !== userId)
      return res
        .status(400)
        .json({ error: 'Você não possui permissão para deletar este Meetup.' });

    if (isBefore(meetup.date, new Date()))
      return res
        .status(400)
        .json({ error: 'Você não pode deletar Meetups que já aconteceram.' });

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
