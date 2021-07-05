const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const DUMMY_USERS = [
	{
		id: 'u1',
		name: 'Steven Abaco',
		email: 'test@test.com',
		password: '123456',
	},
];

const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		return next( new HttpError(
			'Invalid inputs, please check the information you entered.',
			422) 
		);
	}
	const { name, email, password, places } = req.body;

	// Check to see email already exists
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			'Signing up failed, please try again later',
			500
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			'User exists already, please login instead.',
			422
		);
		return next(error);
	}

	const createdUser = new User({
		id: uuidv4(),
		name, // name: name
		email,
		image: 'https://avatars.githubusercontent.com/u/52642808?v=4',
		password,
		places,
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			'Signing up new user failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true}) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	
		try { //Check if email address is valid
			existingUser = await User.findOne({ email: email });
		} catch (err) {
			const error = new HttpError(
				'Logging in failed, please try again later',
				500
			);
			return next(error);
		}
	
	// Temp validation just to check if email and password match... will be updated
	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError(
			'Invalid credentials, could not log you in.',
			401
		)
		return next(error)
		}
	res.json({ message: 'Logged in successfully!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
