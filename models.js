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

	const Task = mongoose.model('Task', {
		name: String,
		time: {
			type: Date,
			default: Date.now,
		},
		priority: Number,
		audio: Buffer,
	});

	const models = {
		User: User,
		Task: Task,
	};

	return models;
};