import { Op } from 'sequelize';
import { isBefore } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

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
        },
      ],
      order: [[Meetup, 'date', 'DESC']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (!meetup)
      return res.status(400).json({ error: 'Meetup não localizado.' });

    if (meetup.user_id === req.userId)
      return res
        .status(400)
        .json({ error: 'Você não pode realizar a inscrição em seus Meetups.' });

    if (isBefore(meetup.date, new Date()))
      return res.status(400).json({
        error:
          'Você não pode realizar a inscrição em Meetups que já aconteceram.',
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
        .json({ error: 'Você já realizou a inscrição nesse Meetup.' });

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
        error: 'Você já realizou a inscrição em um Meetup na mesma data.',
      });
    }

    const subscription = await Subscription.create({
      user_id: req.userId,
      meetup_id: meetup.id,
    });

    // TODO: Enviar e-mail para o organizador

    return res.json(subscription);
  }
}

export default new SubscriptionController();
