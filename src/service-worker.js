self.addEventListener('push', (event) => {
	if (!event.data) {
		return;
	}

	const data = event.data.json();

	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: '/logo_192.png'
		})
	);
});
