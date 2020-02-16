module.exports = (mongoose) => {
	const User = mongoose.model('User', {
		username: String,
		password: String,
		userType: {
			type: String,
			enum: ['family', 'nurse'],
			default: 'nurse',
		},
	});

	const models = {
		User: User,
	};

	return models;
};