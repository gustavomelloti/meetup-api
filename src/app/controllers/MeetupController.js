import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
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

    const meetup = Meetup.create({
      ...req.body,
      user_id: req.user_id,
    });

    return res.json(meetup);
  }
}

export default new MeetupController();
