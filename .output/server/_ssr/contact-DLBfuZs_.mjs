import { t as track } from "./analytics-CloptECG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-DLBfuZs_.js
/**
* Ouvre le client mail par défaut avec un message pré-rempli.
* Le texte tapé par la personne reste intact : on ne fait qu'ouvrir
* l'application mail, c'est elle qui clique sur « Envoyer ».
*/
function openEmail(params) {
	const url = `mailto:${encodeURIComponent(params.to)}?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(params.body)}`;
	track("contact_email_click");
	window.location.href = url;
}
/**
* Ouvre WhatsApp (app ou web) avec un message pré-rempli dans le champ de saisie.
*/
function openWhatsapp(params) {
	const url = `https://wa.me/${params.phone.replace(/\D/g, "")}?text=${encodeURIComponent(params.text)}`;
	track("contact_whatsapp_click");
	window.open(url, "_blank", "noopener,noreferrer");
}
//#endregion
export { openWhatsapp as n, openEmail as t };
