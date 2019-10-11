import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    // TODO
    // Crie uma rota para listar os meetups com filtro por data (não por hora), os resultados dessa listagem devem vir paginados em 10 itens por página. Abaixo tem um exemplo de chamada para a rota de listagem dos meetups:
    // http://localhost:3333/meetups?date=2019-07-01&page=2
    // Nesse exemplo, listaremos a página 2 dos meetups que acontecerão no dia 01 de Julho.
    // Nessa listagem retorne também os dados do organizador.
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

    const meetup = Meetup.create({
      ...req.body,
      user_id: req.user_id,
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

    const userId = req.user_id;

    if (meetup.user_id !== userId)
      return res
        .status(400)
        .json({ error: 'Você não possui permissão para deletar este Meetup.' });

    if ((isBefore(meetup.date), new Date()))
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

    const userId = req.user_id;

    if (meetup.user_id !== userId)
      return res
        .status(400)
        .json({ error: 'Você não possui permissão para deletar este Meetup.' });

    if ((isBefore(meetup.date), new Date()))
      return res
        .status(400)
        .json({ error: 'Você não pode deletar Meetups que já aconteceram.' });

    await Meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
