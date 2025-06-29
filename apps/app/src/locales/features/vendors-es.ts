export const vendors = {
	title: "Proveedores",
	overview: "Resumen General",
	dashboard: {
		title: "Resumen General",
		by_category: "Proveedores por Categoría",
		status: "Estado de Proveedores",
	},
	register: {
		title: "Proveedores",
		create_new: "Crear Proveedor",
	},
	create: "Crear Proveedor",
	vendor_comments: "Comentarios del Proveedor",
	form: {
		vendor_details: "Detalles del Proveedor",
		vendor_name: "Nombre",
		vendor_name_placeholder: "Ingresa el nombre del proveedor",
		vendor_name_description: "Ingresa el nombre del proveedor",
		vendor_website: "Sitio Web",
		vendor_website_placeholder: "Ingresa el sitio web del proveedor",
		vendor_description: "Descripción",
		vendor_description_placeholder: "Ingresa la descripción del proveedor",
		vendor_description_description: "Ingresa una descripción del proveedor",
		vendor_category: "Categoría",
		vendor_category_placeholder: "Selecciona la categoría",
		vendor_status: "Estado",
		vendor_status_placeholder: "Selecciona el estado",
		create_vendor_success: "Proveedor creado exitosamente",
		create_vendor_error: "Error al crear proveedor",
		update_vendor: "Actualizar Proveedor",
		update_vendor_description: "Actualiza los detalles de tu proveedor",
		update_vendor_success: "Proveedor actualizado exitosamente",
		update_vendor_error: "Error al actualizar proveedor",
		searching: "Buscando...",
		existing_vendors_found: "Proveedores existentes potenciales encontrados:",
		search_vendor_placeholder: "Buscar o ingresar nombre del proveedor...",
		suggestions: "Sugerencias",
		no_vendor_found: "No se encontraron proveedores. Puedes crear uno nuevo.",
		create_custom_vendor: "Crear nuevo proveedor: {name}",
		unnamed_vendor: "Proveedor sin nombre",
		continue_creating:
			"Aún puedes continuar creando una nueva entrada de proveedor.",
		no_existing_vendors: "No se encontraron proveedores existentes con ese nombre.",
		search_error: "Error al buscar proveedores.",
		create_new_vendor: "Crear nuevo proveedor:",
	},
	table: {
		name: "Nombre",
		category: "Categoría",
		status: "Estado",
		owner: "Propietario",
	},
	filters: {
		search_placeholder: "Buscar proveedores...",
		status_placeholder: "Filtrar por estado",
	},
	empty_states: {
		no_vendors: {
			title: "Aún no hay proveedores",
			description: "Comienza creando tu primer proveedor",
		},
		no_results: {
			title: "No se encontraron resultados",
			description: "Ningún proveedor coincide con tu búsqueda",
			description_with_filters: "Intenta ajustar tus filtros",
		},
	},
	tasks: {
		title: "Tareas",
		sheet: {
			title: "Crear Tarea del Proveedor",
		},
		attachments: "Archivos Adjuntos",
		columns: {
			title: "Título",
			description: "Descripción",
			status: "Estado",
			due_date: "Fecha de Vencimiento",
			owner: "Propietario",
		},
		filters: {
			search: "Buscar tareas...",
			status: "Filtrar por estado",
			assignee: "Filtrar por responsable",
			all_statuses: "Todos los Estados",
			not_started: "No Iniciado",
			in_progress: "En Progreso",
			completed: "Completado",
			all_assignees: "Todos los Responsables",
			clear: "Limpiar filtros",
		},
		empty: {
			no_results: "No Se Encontraron Resultados",
			no_results_description: "Ninguna tarea coincide con tus filtros actuales",
			clear_filters: "Limpiar Filtros",
			no_tasks: "No Hay Tareas Disponibles",
			no_tasks_description:
				"Actualmente no hay tareas para este proveedor",
		},
	},
	actions: {
		create: "Crear Proveedor",
	},
	status: {
		not_assessed: "No Evaluado",
		in_progress: "En Progreso",
	},
	risks: {
		inherent_risk: "Riesgo Inherente",
		residual_risk: "Riesgo Residual",
		update_inherent_risk: "Actualizar Riesgo Inherente",
		update_inherent_risk_description:
			"Selecciona el nivel de riesgo inherente para este proveedor",
		inherent_risk_updated: "Riesgo inherente actualizado exitosamente",
		update_residual_risk: "Actualizar Riesgo Residual",
		update_residual_risk_description:
			"Selecciona el nivel de riesgo residual para este proveedor",
		residual_risk_updated: "Riesgo residual actualizado exitosamente",
		unknown: "Desconocido",
		low: "Bajo",
		medium: "Medio",
		high: "Alto",
		select_risk: "Seleccionar nivel de riesgo",
		inherent_probability: "Probabilidad Inherente",
		inherent_impact: "Impacto Inherente",
		residual_probability: "Probabilidad Residual",
		residual_impact: "Impacto Residual",
		select_probability: "Seleccionar probabilidad",
		select_impact: "Seleccionar impacto",
		very_unlikely: "Muy Improbable",
		unlikely: "Improbable",
		possible: "Posible",
		likely: "Probable",
		very_likely: "Muy Probable",
		insignificant: "Insignificante",
		minor: "Menor",
		moderate: "Moderado",
		major: "Mayor",
		severe: "Severo",
	},
} as const;