import Meetup from '../models/Meetup';
import File from '../models/File';

class ResponsbileController {
  async index(req, res) {
    const user_id = req.userId;

    const meetups = await Meetup.findAll({
      include: [
        {
          model: File,
          as: 'banner',
        },
      ],
      where: { user_id },
      order: [['id', 'DESC']],
    });

    return res.json(meetups);
  }
}

export default new ResponsbileController();
