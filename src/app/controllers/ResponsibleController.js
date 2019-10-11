import Meetup from '../models/Meetup';

class ResponsbileController {
  async index(req, res) {
    const user_id = req.userId;

    const meetups = await Meetup.findAll({ where: { user_id } });

    return res.json(meetups);
  }
}

export default new ResponsbileController();
