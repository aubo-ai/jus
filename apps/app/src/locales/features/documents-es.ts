export const documents = {
	title: "Documentos",
	home: {
		title: "Resumen de Documentos",
		statusCard: {
			title: "Estado de Documentos",
			description: "Resumen de firmas de documentos",
			comingSoon: "Próximamente",
		},
		activityCard: {
			title: "Actividad Reciente",
			description: "Últimas solicitudes de documentos",
			comingSoon: "Próximamente",
		},
	},
	templates: {
		title: "Plantillas de Documentos",
		description: "Plantillas disponibles para firmas de documentos",
		table: {
			name: "Nombre",
			folder: "Carpeta",
			created: "Creado",
			updated: "Actualizado",
			status: "Estado",
			active: "Activo",
			archived: "Archivado",
		},
		empty: "No hay plantillas disponibles",
		error: {
			title: "Error al cargar plantillas",
			description: "Por favor intente más tarde",
		},
	},
	submissions: {
		title: "Solicitudes de Documentos",
		description: "Seguimiento de solicitudes de firma de documentos y su estado",
		table: {
			submitter: "Solicitante",
			email: "Correo",
			status: "Estado",
			sent: "Enviado",
			opened: "Abierto",
			completed: "Completado",
		},
		status: {
			pending: "Pendiente",
			sent: "Enviado",
			opened: "Abierto",
			completed: "Completado",
		},
		empty: "No se encontraron solicitudes",
		error: {
			title: "Error al cargar solicitudes",
			description: "Por favor intente más tarde",
		},
	},
	tabs: {
		home: "Inicio",
		templates: "Plantillas",
		submissions: "Solicitudes",
	},
} as const;