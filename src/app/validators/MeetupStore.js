import * as Yup from 'yup';
import Messages from '../constants/Messages';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      banner_id: Yup.string().required(),
      date: Yup.date().required(),
    });

    await schema.validate(req.body, { abortEarly: false });
    return next();
  } catch (err) {
    return res.status(400).json({ error: Messages.MessageValidationFail });
  }
};
