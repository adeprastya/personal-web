import { PUBLIC_WEB3FORMS_KEY } from '$env/static/public';

type SendHandler = (name: string, email: string, message: string) => Promise<Response>;

export const web3Send: SendHandler = async (name, email, messaage) => {
	const formData = new FormData();
	formData.append('access_key', PUBLIC_WEB3FORMS_KEY);
	formData.append('name', name);
	formData.append('email', email);
	formData.append('message', messaage);

	try {
		const res = await fetch('https://api.web3forms.com/submit', {
			method: 'POST',
			body: formData
		});

		return await res.json();
	} catch {
		throw new Error('Failed to send message via Web 3 Forms!');
	}
};
