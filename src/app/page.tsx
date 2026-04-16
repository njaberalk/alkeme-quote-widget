"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

// ---- Data ----

const USER_TYPES_INTERNAL = ["individual", "business"];

const INSURANCE_TYPES_INDIVIDUAL = ["Home", "Auto", "Life", "Other"];

const INSURANCE_TYPES_BUSINESS = [
  "General Liability",
  "Workers' Compensation",
  "Property",
  "Commercial Auto",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const INDUSTRIES = [
  "Construction","Healthcare","Manufacturing","Retail","Technology",
  "Food & Beverage","Transportation","Professional Services","Education","Other",
];

const EMPLOYEE_COUNTS = ["1-5", "6-25", "26-50", "51-100", "101-500", "500+"];

// ---- Vertical Configs ----
interface VerticalConfig {
  heading?: string;
  headingEs?: string;
  subtext?: string;
  subtextEs?: string;
  insuranceTypesBusiness: string[];
  insuranceTypesBusinessEs?: string[];
  industries: string[];
  industriesEs?: string[];
  employeeCounts?: string[];
  businessLabel?: string;
  businessLabelEs?: string;
  industryLabel?: string;
  industryLabelEs?: string;
  employeeLabel?: string;
  employeeLabelEs?: string;
}

const VERTICALS: Record<string, VerticalConfig> = {
  trucking: {
    heading: "Get a trucking insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de camiones.",
    subtext: "Answer a few quick questions about your operation.",
    subtextEs: "Responda algunas preguntas sobre su operaci\u00f3n.",
    insuranceTypesBusiness: ["Auto Liability", "Physical Damage", "Motor Truck Cargo", "Workers' Comp", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad Auto", "Da\u00f1o F\u00edsico", "Carga", "Comp. Laboral", "No Estoy Seguro"],
    industries: ["Owner-Operator", "Small Fleet (2-15)", "Large Fleet (16+)", "Hot Shot", "Flatbed", "Refrigerated", "Hazmat", "Intermodal", "LTL/Last Mile", "Other"],
    industriesEs: ["Operador-Propietario", "Flota Peque\u00f1a (2-15)", "Flota Grande (16+)", "Hot Shot", "Plataforma", "Refrigerado", "Materiales Peligrosos", "Intermodal", "LTL/\u00daltima Milla", "Otro"],
    employeeCounts: ["1", "2-5", "6-15", "16-50", "50+"],
    businessLabel: "a trucking operation",
    businessLabelEs: "una operaci\u00f3n de camiones",
    industryLabel: "operation type",
    industryLabelEs: "tipo de operaci\u00f3n",
    employeeLabel: "power units.",
    employeeLabelEs: "unidades de potencia.",
  },
  towing: {
    heading: "Get a towing insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de gr\u00faas.",
    subtext: "Answer a few quick questions about your operation.",
    subtextEs: "Responda algunas preguntas sobre su operaci\u00f3n.",
    insuranceTypesBusiness: ["Auto Liability", "On-Hook Coverage", "Garagekeepers", "Workers' Comp", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad Auto", "Cobertura en Gancho", "Garagekeepers", "Comp. Laboral", "No Estoy Seguro"],
    industries: ["Light-Duty Towing", "Medium-Duty Towing", "Heavy-Duty Recovery", "Roadside Assistance", "Repossession", "Municipal/Police Towing", "Motor Club", "Long-Distance", "Motorcycle Specialty", "Other"],
    industriesEs: ["Gr\u00faa Liviana", "Gr\u00faa Mediana", "Recuperaci\u00f3n Pesada", "Asistencia en Carretera", "Reposesi\u00f3n", "Gr\u00faa Municipal/Policial", "Club de Motor", "Larga Distancia", "Especialidad en Motos", "Otro"],
    employeeCounts: ["1-3", "4-10", "11-25", "25+"],
    businessLabel: "a towing operation",
    businessLabelEs: "una operaci\u00f3n de gr\u00faas",
    industryLabel: "towing type",
    industryLabelEs: "tipo de gr\u00faa",
    employeeLabel: "tow trucks.",
    employeeLabelEs: "gr\u00faas.",
  },
  cannabis: {
    heading: "Get a cannabis insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de cannabis.",
    subtext: "Answer a few quick questions about your operation.",
    subtextEs: "Responda algunas preguntas sobre su operaci\u00f3n.",
    insuranceTypesBusiness: ["General Liability", "Product Liability", "Crop Coverage", "Workers' Comp", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Responsabilidad de Producto", "Cobertura de Cultivo", "Comp. Laboral", "No Estoy Seguro"],
    industries: ["Dispensary/Retail", "Cultivator/Grower", "Manufacturer/Processor", "Distributor", "Testing Lab", "Multi-License Operator", "Hemp/CBD", "Delivery Services", "Ancillary", "Other"],
    industriesEs: ["Dispensario/Minorista", "Cultivador/Productor", "Fabricante/Procesador", "Distribuidor", "Laboratorio", "Operador Multi-Licencia", "C\u00e1\u00f1amo/CBD", "Servicios de Entrega", "Auxiliar", "Otro"],
    employeeCounts: ["1-5", "6-15", "16-30", "31-50", "50+"],
    businessLabel: "a cannabis business",
    businessLabelEs: "un negocio de cannabis",
    industryLabel: "license type",
    industryLabelEs: "tipo de licencia",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  hospitality: {
    heading: "Get a hospitality insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de hospitalidad.",
    subtext: "Answer a few quick questions about your venue.",
    subtextEs: "Responda algunas preguntas sobre su establecimiento.",
    insuranceTypesBusiness: ["General Liability", "Liquor Liability", "Property", "Workers' Comp", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Responsabilidad de Licor", "Propiedad", "Comp. Laboral", "No Estoy Seguro"],
    industries: ["Restaurant", "Bar/Nightclub", "Hotel/Resort", "Brewery/Winery", "Catering/Events", "Cafe/Coffee", "Food Truck", "Banquet Venue", "Boutique Hotel", "Other"],
    industriesEs: ["Restaurante", "Bar/Club Nocturno", "Hotel/Resort", "Cervecer\u00eda/Bodega", "Catering/Eventos", "Caf\u00e9", "Cami\u00f3n de Comida", "Sal\u00f3n de Banquetes", "Hotel Boutique", "Otro"],
    businessLabel: "a hospitality business",
    businessLabelEs: "un negocio de hospitalidad",
    industryLabel: "venue type",
    industryLabelEs: "tipo de establecimiento",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  construction: {
    heading: "Get a construction insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de construcci\u00f3n.",
    subtext: "Answer a few quick questions about your operation.",
    subtextEs: "Responda algunas preguntas sobre su operaci\u00f3n.",
    insuranceTypesBusiness: ["General Liability", "Workers' Comp", "Builders Risk", "Commercial Auto", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Comp. Laboral", "Riesgo de Constructores", "Auto Comercial", "No Estoy Seguro"],
    industries: ["General Contractor", "Residential Builder", "Commercial Builder", "Electrical", "Plumbing/HVAC", "Roofing", "Concrete/Masonry", "Demolition", "Design-Build", "Other"],
    industriesEs: ["Contratista General", "Constructor Residencial", "Constructor Comercial", "El\u00e9ctrico", "Plomer\u00eda/HVAC", "Techos", "Concreto/Mamposter\u00eda", "Demolici\u00f3n", "Dise\u00f1o-Construcci\u00f3n", "Otro"],
    employeeCounts: ["1-5", "6-15", "16-50", "51-100", "100+"],
    businessLabel: "a construction company",
    businessLabelEs: "una empresa de construcci\u00f3n",
    industryLabel: "trade",
    industryLabelEs: "oficio",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  'employee-benefits': {
    heading: "Get an employee benefits consultation.",
    headingEs: "Obtenga una consulta de beneficios para empleados.",
    subtext: "Answer a few quick questions about your workforce.",
    subtextEs: "Responda algunas preguntas sobre su fuerza laboral.",
    insuranceTypesBusiness: ["Group Health", "Dental", "Vision", "Retirement Plans", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Salud Grupal", "Dental", "Visi\u00f3n", "Planes de Jubilaci\u00f3n", "No Estoy Seguro"],
    industries: ["Small Business (2-50)", "Mid-Market (51-250)", "Large Employer (250+)", "Nonprofit", "Technology", "Healthcare", "Manufacturing", "Professional Services", "Retail/Hospitality", "Other"],
    industriesEs: ["Peque\u00f1a Empresa (2-50)", "Mediana Empresa (51-250)", "Gran Empleador (250+)", "Sin Fines de Lucro", "Tecnolog\u00eda", "Salud", "Manufactura", "Servicios Profesionales", "Comercio/Hospitalidad", "Otro"],
    employeeCounts: ["2-10", "11-50", "51-250", "251-1000", "1000+"],
    businessLabel: "an employer",
    businessLabelEs: "un empleador",
    industryLabel: "company type",
    industryLabelEs: "tipo de empresa",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  'business-insurance': {
    heading: "Get a business insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro comercial.",
    subtext: "Answer a few quick questions about your business.",
    subtextEs: "Responda algunas preguntas sobre su negocio.",
    insuranceTypesBusiness: ["General Liability", "Workers' Comp", "Commercial Property", "Cyber Liability", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Comp. Laboral", "Propiedad Comercial", "Responsabilidad Cibern\u00e9tica", "No Estoy Seguro"],
    industries: ["Construction", "Technology", "Retail", "Manufacturing", "Hospitality", "Professional Services", "Real Estate", "Logistics", "Healthcare", "Other"],
    industriesEs: ["Construcci\u00f3n", "Tecnolog\u00eda", "Comercio", "Manufactura", "Hospitalidad", "Servicios Profesionales", "Bienes Ra\u00edces", "Log\u00edstica", "Salud", "Otro"],
    businessLabel: "a business",
    businessLabelEs: "un negocio",
    industryLabel: "industry",
    industryLabelEs: "industria",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  entertainment: {
    heading: "Get an entertainment insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de entretenimiento.",
    subtext: "Answer a few quick questions about your production or event.",
    subtextEs: "Responda algunas preguntas sobre su producci\u00f3n o evento.",
    insuranceTypesBusiness: ["General Liability", "Production Insurance", "Event Cancellation", "Equipment Floater", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Seguro de Producci\u00f3n", "Cancelaci\u00f3n de Eventos", "Cobertura de Equipo", "No Estoy Seguro"],
    industries: ["Film/TV Production", "Live Events", "Music Venue", "Theater/Performing Arts", "Sports Entertainment", "Amusement Park", "Festival/Fair", "Streaming/Digital", "Talent Agency", "Other"],
    industriesEs: ["Producci\u00f3n de Cine/TV", "Eventos en Vivo", "Sala de M\u00fasica", "Teatro/Artes Esc\u00e9nicas", "Entretenimiento Deportivo", "Parque de Diversiones", "Festival/Feria", "Streaming/Digital", "Agencia de Talentos", "Otro"],
    businessLabel: "an entertainment company",
    businessLabelEs: "una empresa de entretenimiento",
    industryLabel: "entertainment type",
    industryLabelEs: "tipo de entretenimiento",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  habitational: {
    heading: "Get a habitational insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro habitacional.",
    subtext: "Answer a few quick questions about your properties.",
    subtextEs: "Responda algunas preguntas sobre sus propiedades.",
    insuranceTypesBusiness: ["Property Insurance", "General Liability", "Flood Insurance", "Umbrella/Excess", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Seguro de Propiedad", "Responsabilidad General", "Seguro contra Inundaciones", "Paraguas/Exceso", "No Estoy Seguro"],
    industries: ["Apartment Complex", "Condominium", "Student Housing", "HOA", "Mixed-Use Property", "Property Management", "Single-Family Rentals", "Affordable Housing", "Vacation Rentals", "Other"],
    industriesEs: ["Complejo de Apartamentos", "Condominio", "Vivienda Estudiantil", "HOA", "Propiedad de Uso Mixto", "Administraci\u00f3n de Propiedades", "Alquileres Unifamiliares", "Vivienda Asequible", "Alquileres Vacacionales", "Otro"],
    employeeCounts: ["1-10", "11-50", "51-100", "101-500", "500+"],
    businessLabel: "a property owner/manager",
    businessLabelEs: "un propietario/administrador",
    industryLabel: "property type",
    industryLabelEs: "tipo de propiedad",
    employeeLabel: "units.",
    employeeLabelEs: "unidades.",
  },
  automotive: {
    heading: "Get an automotive insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro automotriz.",
    subtext: "Answer a few quick questions about your dealership or shop.",
    subtextEs: "Responda algunas preguntas sobre su concesionario o taller.",
    insuranceTypesBusiness: ["Garage Liability", "Garagekeepers", "Dealers Open Lot", "Workers' Comp", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad de Garaje", "Garagekeepers", "Lote Abierto", "Comp. Laboral", "No Estoy Seguro"],
    industries: ["Franchise Dealership", "Independent Dealer", "Auto Repair Shop", "Body/Collision Shop", "Parts Distributor", "Fleet Management", "Car Rental", "Tire Shop", "Auto Detailing", "Other"],
    industriesEs: ["Concesionario de Franquicia", "Distribuidor Independiente", "Taller Mec\u00e1nico", "Taller de Carrocer\u00eda", "Distribuidor de Partes", "Gesti\u00f3n de Flotas", "Alquiler de Autos", "Llanter\u00eda", "Detallado Automotriz", "Otro"],
    businessLabel: "an automotive business",
    businessLabelEs: "un negocio automotriz",
    industryLabel: "operation type",
    industryLabelEs: "tipo de operaci\u00f3n",
    employeeLabel: "employees.",
    employeeLabelEs: "empleados.",
  },
  security: {
    heading: "Get a security insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de seguridad.",
    subtext: "Answer a few quick questions about your security operation.",
    subtextEs: "Responda algunas preguntas sobre su operaci\u00f3n de seguridad.",
    insuranceTypesBusiness: ["General Liability", "Professional Liability", "Assault & Battery", "Firearms Liability", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Responsabilidad Profesional", "Asalto y Agresiones", "Responsabilidad de Armas", "No Estoy Seguro"],
    industries: ["Armed Guards", "Unarmed Security", "Executive Protection", "Event Security", "Campus Security", "Patrol Services", "Mobile Patrol", "Loss Prevention", "Cannabis Security", "Other"],
    industriesEs: ["Guardias Armados", "Seguridad sin Armas", "Protecci\u00f3n Ejecutiva", "Seguridad de Eventos", "Seguridad de Campus", "Servicios de Patrulla", "Patrulla M\u00f3vil", "Prevenci\u00f3n de P\u00e9rdidas", "Seguridad de Cannabis", "Otro"],
    employeeCounts: ["1-10", "11-25", "26-50", "51-100", "100+"],
    businessLabel: "a security company",
    businessLabelEs: "una empresa de seguridad",
    industryLabel: "service type",
    industryLabelEs: "tipo de servicio",
    employeeLabel: "guards.",
    employeeLabelEs: "guardias.",
  },
  'senior-living': {
    heading: "Get a senior living insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de vida asistida.",
    subtext: "Answer a few quick questions about your facility.",
    subtextEs: "Responda algunas preguntas sobre su instalaci\u00f3n.",
    insuranceTypesBusiness: ["General Liability", "Professional Liability", "Abuse & Molestation", "Workers' Comp", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Responsabilidad Profesional", "Abuso y Acoso", "Comp. Laboral", "No Estoy Seguro"],
    industries: ["Assisted Living", "Skilled Nursing", "Memory Care", "Independent Living", "CCRC", "Home Health Agency", "Adult Day Care", "Hospice", "Rehabilitation Center", "Other"],
    industriesEs: ["Vida Asistida", "Enfermer\u00eda Especializada", "Cuidado de Memoria", "Vida Independiente", "CCRC", "Agencia de Salud en el Hogar", "Centro de D\u00eda para Adultos", "Hospicio", "Centro de Rehabilitaci\u00f3n", "Otro"],
    employeeCounts: ["1-25", "26-50", "51-100", "101-250", "250+"],
    businessLabel: "a senior care facility",
    businessLabelEs: "una instalaci\u00f3n de cuidado de adultos mayores",
    industryLabel: "facility type",
    industryLabelEs: "tipo de instalaci\u00f3n",
    employeeLabel: "beds/residents.",
    employeeLabelEs: "camas/residentes.",
  },
  education: {
    heading: "Get an education insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro educativo.",
    subtext: "Answer a few quick questions about your institution.",
    subtextEs: "Responda algunas preguntas sobre su instituci\u00f3n.",
    insuranceTypesBusiness: ["General Liability", "Professional Liability", "Abuse & Molestation", "Cyber Liability", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Responsabilidad Profesional", "Abuso y Acoso", "Responsabilidad Cibern\u00e9tica", "No Estoy Seguro"],
    industries: ["K-12 Public School", "K-12 Private School", "Charter School", "College/University", "Preschool/Daycare", "Trade/Vocational", "Online Education", "Special Education", "After-School Program", "Other"],
    industriesEs: ["Escuela P\u00fablica K-12", "Escuela Privada K-12", "Escuela Ch\u00e1rter", "Universidad", "Preescolar/Guarder\u00eda", "T\u00e9cnica/Vocacional", "Educaci\u00f3n en L\u00ednea", "Educaci\u00f3n Especial", "Programa Extraescolar", "Otro"],
    employeeCounts: ["1-25", "26-100", "101-500", "501-2000", "2000+"],
    businessLabel: "an educational institution",
    businessLabelEs: "una instituci\u00f3n educativa",
    industryLabel: "institution type",
    industryLabelEs: "tipo de instituci\u00f3n",
    employeeLabel: "students.",
    employeeLabelEs: "estudiantes.",
  },
  architecture: {
    heading: "Get an architecture insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro de arquitectura.",
    subtext: "Answer a few quick questions about your firm.",
    subtextEs: "Responda algunas preguntas sobre su firma.",
    insuranceTypesBusiness: ["Professional Liability (E&O)", "General Liability", "Cyber Liability", "Project-Specific", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad Profesional (E&O)", "Responsabilidad General", "Responsabilidad Cibern\u00e9tica", "Espec\u00edfico de Proyecto", "No Estoy Seguro"],
    industries: ["Residential Architecture", "Commercial Architecture", "Landscape Architecture", "Interior Design", "Urban Planning", "Structural Engineering", "Sustainable Design", "Historic Preservation", "Multi-Discipline", "Other"],
    industriesEs: ["Arquitectura Residencial", "Arquitectura Comercial", "Arquitectura Paisaj\u00edstica", "Dise\u00f1o de Interiores", "Planificaci\u00f3n Urbana", "Ingenier\u00eda Estructural", "Dise\u00f1o Sustentable", "Preservaci\u00f3n Hist\u00f3rica", "Multi-Disciplina", "Otro"],
    employeeCounts: ["Solo", "2-10", "11-25", "26-50", "50+"],
    businessLabel: "an architecture firm",
    businessLabelEs: "una firma de arquitectura",
    industryLabel: "practice type",
    industryLabelEs: "tipo de pr\u00e1ctica",
    employeeLabel: "staff.",
    employeeLabelEs: "personal.",
  },
  'pool-contractors': {
    heading: "Get a pool contractor insurance quote.",
    headingEs: "Obtenga una cotizaci\u00f3n de seguro para contratistas de piscinas.",
    subtext: "Answer a few quick questions about your business.",
    subtextEs: "Responda algunas preguntas sobre su negocio.",
    insuranceTypesBusiness: ["General Liability", "Completed Operations", "Workers' Comp", "Pollution Liability", "Not Sure \u2014 Help Me Decide"],
    insuranceTypesBusinessEs: ["Responsabilidad General", "Operaciones Completadas", "Comp. Laboral", "Responsabilidad por Contaminaci\u00f3n", "No Estoy Seguro"],
    industries: ["Pool Builder", "Hot Tub Installer", "Pool Service/Maintenance", "Pool Remodeling", "Commercial Pools", "Water Features", "Equipment Supplier", "Spa Contractor", "Pool Demolition", "Other"],
    industriesEs: ["Constructor de Piscinas", "Instalador de Jacuzzis", "Servicio/Mantenimiento", "Remodelaci\u00f3n de Piscinas", "Piscinas Comerciales", "Fuentes de Agua", "Proveedor de Equipo", "Contratista de Spa", "Demolici\u00f3n de Piscinas", "Otro"],
    employeeCounts: ["1-5", "6-15", "16-30", "31-50", "50+"],
    businessLabel: "a pool contractor",
    businessLabelEs: "un contratista de piscinas",
    industryLabel: "service type",
    industryLabelEs: "tipo de servicio",
    employeeLabel: "crew members.",
    employeeLabelEs: "miembros del equipo.",
  },
};

const LANG_KEY = "insurance-form-lang";

// ---- i18n ----

type Lang = "en" | "es";

const i18n = {
  en: {
    // Landing
    landingHeading: "Find the right coverage for you.",
    landingSubtext: "Answer a few quick questions to get started.",
    getStarted: "Get Started",
    // Step labels
    letsGetStarted: "Let's get started",
    tellUsAboutYourself: "Tell us about yourself",
    aboutYourBusiness: "About your business",
    almostDone: "Almost done",
    // Step 1 sentence
    iAm: "I'm",
    anIndividual: "an individual",
    aBusiness: "a business",
    readyToExplore: "ready to explore insurance and discover the right coverage for me.",
    selectAllThatApply: "Select all that apply",
    // Step 2 sentence
    myFirstNameIs: "My first name is",
    andMyLastNameIs: "and my last name is",
    iNeedCoverageIn: ". I need coverage in",
    // Placeholders
    firstName: "first name",
    lastName: "last name",
    city: "city",
    state: "state",
    // Step 3 sentence
    myBusinessIsIn: "My business is in",
    with: "with",
    withEmployees: "employees.",
    industry: "industry",
    count: "count",
    // Step 4 sentence
    reachMeAt: "Reach me at",
    or: "or",
    phonePlaceholder: "(555) 123-4567",
    emailPlaceholder: "email@example.com",
    anythingElse: "Anything else we should know? (optional)",
    typeYourMessage: "Type your message here...",
    phoneError: "Please enter a valid phone number (10-digit US number)",
    emailError: "Please enter a valid email address",
    submitError: "Something went wrong. Please try again.",
    tryAgain: "Try Again",
    // Buttons
    continue: "Continue →",
    submit: "Submit →",
    submitting: "Submitting...",
    done: "Done",
    startOver: "Start Over",
    back: "← Back",
    stay: "Stay",
    close: "Close",
    // Confirm dialog
    closeTheForm: "Close the form?",
    progressSaved: "Your progress has been saved. You can pick up where you left off.",
    // Success
    allSet: "You're all set",
    weReceived: "We've received your information and will be in touch soon.",
    // Comments
    // Search
    typeToSearch: "Type to search...",
    noResults: "No results",
    // Modal aria
    modalAriaLabel: "Insurance quote form",
    // Language toggle
    langToggleEn: "EN",
    langToggleEs: "ES",
    // Insurance type labels
    insuranceHome: "Home",
    insuranceAuto: "Auto",
    insuranceLife: "Life",
    insuranceOther: "Other",
    insuranceGL: "General Liability",
    insuranceWC: "Workers' Compensation",
    insuranceProperty: "Property",
    insuranceCA: "Commercial Auto",
    // Industry labels
    industryConstruction: "Construction",
    industryHealthcare: "Healthcare",
    industryManufacturing: "Manufacturing",
    industryRetail: "Retail",
    industryTechnology: "Technology",
    industryFood: "Food & Beverage",
    industryTransportation: "Transportation",
    industryProfessional: "Professional Services",
    industryEducation: "Education",
    industryOther: "Other",
  },
  es: {
    landingHeading: "Encuentra la cobertura adecuada para ti.",
    landingSubtext: "Responde unas preguntas rápidas para comenzar.",
    getStarted: "Comenzar",
    letsGetStarted: "Empecemos",
    tellUsAboutYourself: "Cuéntanos sobre ti",
    aboutYourBusiness: "Sobre tu negocio",
    almostDone: "Casi listo",
    iAm: "Soy",
    anIndividual: "un individuo",
    aBusiness: "una empresa",
    readyToExplore: "listo para explorar seguros y encontrar la cobertura correcta para mí.",
    selectAllThatApply: "Selecciona todas las que apliquen",
    myFirstNameIs: "Mi nombre es",
    andMyLastNameIs: "y mi apellido es",
    iNeedCoverageIn: ". Necesito cobertura en",
    firstName: "nombre",
    lastName: "apellido",
    city: "ciudad",
    state: "estado",
    myBusinessIsIn: "Mi negocio está en",
    with: "con",
    withEmployees: "empleados.",
    industry: "industria",
    count: "cantidad",
    reachMeAt: "Contáctame al",
    or: "o",
    phonePlaceholder: "(555) 123-4567",
    emailPlaceholder: "correo@ejemplo.com",
    anythingElse: "¿Algo más que debamos saber? (opcional)",
    typeYourMessage: "Escribe tu mensaje aquí...",
    phoneError: "Por favor ingresa un número de teléfono válido (10 dígitos de EE.UU.)",
    emailError: "Por favor ingresa una dirección de correo electrónico válida",
    submitError: "Algo salió mal. Por favor, intenta de nuevo.",
    tryAgain: "Intentar de nuevo",
    continue: "Continuar →",
    submit: "Enviar →",
    submitting: "Enviando...",
    done: "Listo",
    startOver: "Empezar de nuevo",
    back: "← Atrás",
    stay: "Quedarse",
    close: "Cerrar",
    closeTheForm: "¿Cerrar el formulario?",
    progressSaved: "Tu progreso ha sido guardado. Puedes retomarlo donde lo dejaste.",
    allSet: "¡Todo listo",
    weReceived: "Hemos recibido tu información y nos comunicaremos pronto.",
    typeToSearch: "Escribe para buscar...",
    noResults: "Sin resultados",
    modalAriaLabel: "Formulario de cotización de seguro",
    langToggleEn: "EN",
    langToggleEs: "ES",
    // Insurance type labels
    insuranceHome: "Hogar",
    insuranceAuto: "Auto",
    insuranceLife: "Vida",
    insuranceOther: "Otro",
    insuranceGL: "Responsabilidad General",
    insuranceWC: "Compensación Laboral",
    insuranceProperty: "Propiedad",
    insuranceCA: "Auto Comercial",
    // Industry labels
    industryConstruction: "Construcción",
    industryHealthcare: "Salud",
    industryManufacturing: "Manufactura",
    industryRetail: "Comercio",
    industryTechnology: "Tecnología",
    industryFood: "Alimentos y Bebidas",
    industryTransportation: "Transporte",
    industryProfessional: "Servicios Profesionales",
    industryEducation: "Educación",
    industryOther: "Otro",
  },
} as const;

// Translation maps: internal value → i18n key
const insuranceTypeKeys: Record<string, string> = {
  Home: "insuranceHome", Auto: "insuranceAuto", Life: "insuranceLife", Other: "insuranceOther",
  "General Liability": "insuranceGL", "Workers' Compensation": "insuranceWC",
  Property: "insuranceProperty", "Commercial Auto": "insuranceCA",
};

const industryKeys: Record<string, string> = {
  Construction: "industryConstruction", Healthcare: "industryHealthcare",
  Manufacturing: "industryManufacturing", Retail: "industryRetail",
  Technology: "industryTechnology", "Food & Beverage": "industryFood",
  Transportation: "industryTransportation", "Professional Services": "industryProfessional",
  Education: "industryEducation", Other: "industryOther",
};

function tLabel(t: Record<string, string>, key: string, maps: Record<string, string>): string {
  const k = maps[key];
  return k && t[k] ? t[k] : key;
}

// ---- Analytics ----

function trackEvent(name: string, detail: Record<string, unknown> = {}) {
  try {
    window.dispatchEvent(
      new CustomEvent("insurance-form-event", { detail: { event: name, ...detail } })
    );
  } catch { /* ignore */ }
}

// ---- Confetti ----

const CONFETTI_COLORS = ["#FFBF3C", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96c93d"];

function Confetti() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  ).current;

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(340px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: 0,
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.5,
              backgroundColor: p.color,
              borderRadius: 2,
              animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ---- Main Component ----

export default function GetStarted() {
  // Read vertical from URL params — initialize synchronously to avoid flash
  const [vertical] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const v = new URLSearchParams(window.location.search).get('vertical');
      return v && VERTICALS[v] ? v : null;
    } catch { return null; }
  });

  const vConfig = vertical ? VERTICALS[vertical] : undefined;

  // When vertical is set, start with modal open on step 3 (skip landing + step 1)
  const [modalOpen, setModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const params = new URLSearchParams(window.location.search);
      return !!(params.get('vertical') || params.get('embed'));
    } catch { return false; }
  });
  const [step, setStep] = useState(() => vertical ? 3 : 1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const [userType, setUserType] = useState(vertical ? "business" : ""); // "individual" | "business"
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");

  // Validation touch states
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Analytics ref
  const stepStartTime = useRef<number>(Date.now());
  const modalCardRef = useRef<HTMLDivElement>(null);

  // Announce step changes for a11y
  const [liveRegion, setLiveRegion] = useState("");

  // Force modal open for vertical embeds (SSR workaround)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('vertical');
      const embed = params.get('embed');
      if (v || embed) {
        setModalOpen(true);
        if (v && VERTICALS[v]) {
          setUserType("business");
          setStep(3);
        }
      }
    } catch {}
  }, []);

  // ---- Language restore ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "es") setLang(saved);
    } catch { /* ignore */ }
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    // Clear selections that use language-dependent values
    setInsuranceTypes([]);
    setIndustry("");
    try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };

  const t = i18n[lang];

  // Language-aware active arrays
  const activeInsuranceTypesBusiness = lang === 'es' && vConfig?.insuranceTypesBusinessEs
    ? vConfig.insuranceTypesBusinessEs
    : vConfig?.insuranceTypesBusiness || INSURANCE_TYPES_BUSINESS;
  const activeIndustries = lang === 'es' && vConfig?.industriesEs
    ? vConfig.industriesEs
    : vConfig?.industries || INDUSTRIES;
  const activeEmployeeCounts = vConfig?.employeeCounts || EMPLOYEE_COUNTS;

  // Language-aware heading, subtext, and labels
  const heading = lang === 'es' && vConfig?.headingEs ? vConfig.headingEs : vConfig?.heading || t.landingHeading;
  const subtext = lang === 'es' && vConfig?.subtextEs ? vConfig.subtextEs : vConfig?.subtext || t.landingSubtext;
  const businessLabel = lang === 'es' && vConfig?.businessLabelEs ? vConfig.businessLabelEs : vConfig?.businessLabel || t.aBusiness;
  const industryLabelText = lang === 'es' && vConfig?.industryLabelEs ? vConfig.industryLabelEs : vConfig?.industryLabel || t.industry;
  const employeeLabelText = lang === 'es' && vConfig?.employeeLabelEs ? vConfig.employeeLabelEs : vConfig?.employeeLabel || t.withEmployees;


  // ---- Pre-fill from URL params ----
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pType = params.get("type");
      if (pType === "individual" || pType === "business") setUserType(pType);
      const pState = params.get("state");
      if (pState && US_STATES.includes(pState)) setState(pState);
      const pFirst = params.get("firstName");
      if (pFirst) setFirstName(pFirst);
      const pLast = params.get("lastName");
      if (pLast) setLastName(pLast);
      const pCity = params.get("city");
      if (pCity) setCity(pCity);
      const pLang = params.get("lang");
      if (pLang === "es") setLang("es");

      // When vertical is set, auto-open and skip to business step
      const pVertical = params.get("vertical");
      const embed = params.get("embed");
      if (embed === "modal" || pVertical) {
        setModalOpen(true);
        if (pVertical && VERTICALS[pVertical]) {
          setUserType("business");
          setStep(3);
        }
      }
    } catch { /* ignore */ }
  }, []);


  // ---- Analytics: step viewed ----
  useEffect(() => {
    if (!modalOpen) return;
    stepStartTime.current = Date.now();
    const stepNames: Record<number, string> = { 1: "coverage_type", 2: "personal_info", 3: "business_info", 4: "contact", 5: "success" };
    trackEvent("step_viewed", { step, stepName: stepNames[step] ?? `step_${step}` });
    const label = step === 1 ? t.letsGetStarted
      : step === 2 ? t.tellUsAboutYourself
      : step === 3 ? t.aboutYourBusiness
      : step === 4 ? t.almostDone
      : t.allSet;
    setLiveRegion(label);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, modalOpen]);

  // Focus trap in modal
  useEffect(() => {
    if (!modalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      if (modalCardRef.current && !modalCardRef.current.contains(document.activeElement)) {
        modalCardRef.current.focus();
      }
    });
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const modal = modalCardRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !modal.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !modal.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      previouslyFocused?.focus();
    };
  }, [modalOpen]);

  const handleUserTypeChange = (v: string) => {
    if (v !== userType) setInsuranceTypes([]);
    setUserType(v);
  };

  const toggleInsuranceType = (type: string) => {
    setInsuranceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isBusiness = userType === "business";
  const sentenceComplete = !!userType && insuranceTypes.length > 0;
  const phoneValid = phone.length === 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const personalComplete = firstName.trim().length > 0 && lastName.trim().length > 0 && city.trim().length > 0 && !!state;
  const businessComplete = !!industry && !!employeeCount;
  const contactComplete = phoneValid && emailValid;

  const canAdvance =
    (step === 1 && sentenceComplete) ||
    (step === 2 && personalComplete) ||
    (step === 3 && businessComplete) ||
    (step === 4 && contactComplete);

  // Progress dots
  const totalSteps = isBusiness ? 4 : 3;
  const currentDot = step === 1 ? 0 : step === 2 ? 1 : step === 3 ? 2 : (isBusiness ? 3 : 2);

  const completeStep = () => {
    const duration = Date.now() - stepStartTime.current;
    const stepNames: Record<number, string> = { 1: "coverage_type", 2: "personal_info", 3: "business_info", 4: "contact" };
    trackEvent("step_completed", { step, stepName: stepNames[step] ?? `step_${step}`, durationMs: duration });
  };

  const verticalStepOrder = [3, 2, 4];

  const nextStep = () => {
    completeStep();
    setDirection("forward");
    if (vertical) {
      const currentIdx = verticalStepOrder.indexOf(step);
      if (currentIdx >= 0 && currentIdx < verticalStepOrder.length - 1) {
        setStep(verticalStepOrder[currentIdx + 1]);
      } else {
        setStep(step + 1);
      }
    } else {
      if (step === 2 && !isBusiness) setStep(4);
      else setStep(step + 1);
    }
  };

  const prevStep = () => {
    setDirection("back");
    if (vertical) {
      const currentIdx = verticalStepOrder.indexOf(step);
      if (currentIdx <= 0) {
        setModalOpen(false);
        return;
      }
      setStep(verticalStepOrder[currentIdx - 1]);
    } else {
      if (step === 4 && !isBusiness) setStep(2);
      else setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          email, fullName: `${firstName.trim()} ${lastName.trim()}`, userType,
          insuranceType: insuranceTypes.join(", "),
          city, state, industry, employeeCount, phone, comments,
          vertical: vertical || 'general',
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (e) {
      console.error("Submit error:", e);
      setSubmitting(false);
      setSubmitError(true);
      return;
    } finally {
      clearTimeout(timeout);
    }
    completeStep();
    trackEvent("form_submitted", { userType, insuranceTypes, state });
    setSubmitting(false);
    setDirection("forward");
    setStep(5);
  };

  // Close with confirmation
  const hasData = !!(userType || firstName || lastName || city || state || phone || email);

  // Beforeunload warning when user has entered data
  useEffect(() => {
    if (!hasData || step >= 5) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasData, step]);

  const tryClose = () => {
    if (vertical) {
      // When embedded, skip confirmation — just close and notify parent
      trackEvent("form_closed", { step });
      setModalOpen(false);
      try { window.parent.postMessage('insurance-form-close', '*'); } catch {}
      return;
    }
    if (hasData && step < 5) setShowConfirm(true);
    else {
      trackEvent("form_closed", { step });
      setModalOpen(false);
    }
  };

  const confirmClose = () => {
    trackEvent("form_closed", { step, confirmed: true });
    setShowConfirm(false);
    setModalOpen(false);
    try { window.parent.postMessage('insurance-form-close', '*'); } catch {}
  };

  const handleOpen = () => {
    trackEvent("form_opened");
    setModalOpen(true);
    if (!hasData) { setStep(1); setDirection("forward"); }
  };

  const handleStartOver = () => {
    setUserType(""); setInsuranceTypes([]); setFirstName(""); setLastName("");
    setCity(""); setState(""); setIndustry(""); setEmployeeCount("");
    setPhone(""); setEmail(""); setComments("");
    setPhoneTouched(false); setEmailTouched(false);
    setSubmitError(false); setDirection("forward"); setStep(1);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [modalOpen]);

  // Prevent page-level scrollbar in embed/vertical mode
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('vertical') || params.get('embed')) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.documentElement.style.height = "100%";
        document.body.style.height = "100%";
      }
    } catch { /* ignore */ }
  }, []);

  // Sync html lang attribute with language toggle
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Keyboard: Enter to advance, Escape to close
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (showConfirm) setShowConfirm(false);
      else tryClose();
      return;
    }
    if (e.key !== "Enter" || submitting) return;
    const el = e.target as HTMLElement;
    if (el.tagName === "TEXTAREA") return;
    if (el.classList.contains("custom-select-search")) return;
    if (!canAdvance) return;
    e.preventDefault();
    if (step === 4) handleSubmit();
    else nextStep();
  };

  // Display label for userType in dropdown trigger
  const userTypeLabel = userType === "individual" ? t.anIndividual : userType === "business" ? businessLabel : "";

  // When embedded with vertical, force modal open immediately and skip render of background
  if (vertical && !modalOpen) {
    setModalOpen(true);
    setUserType("business");
    setStep(3);
  }

  return (
    <div className={vertical ? "" : "min-h-screen flex items-center justify-center"} style={{ background: vertical ? "transparent" : "var(--background)" }}>
      {/* Landing — only shown when NOT embedded with a vertical */}
      {!vertical && (
        <div className="text-center fade-in landing-view">
          <div className="mb-10 flex justify-center">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="14" fill="#FFBF3C" />
              <path d="M18 30 L26.5 38.5 L42 22" stroke="#25475E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="sentence-heading mb-4">{heading}</h1>
          <p className="text-lg font-light mb-10" style={{ color: "var(--text-muted)" }}>
            {subtext}
          </p>
          <button className="btn-primary" aria-label={t.getStarted} onClick={handleOpen}>
            {t.getStarted}
          </button>
        </div>
      )}

      {/* Aria live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        {liveRegion}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) tryClose(); }}
        >
          <div
            ref={modalCardRef}
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={t.modalAriaLabel}
            tabIndex={-1}
            onKeyDown={handleModalKeyDown}
          >
            {step < 5 && (
              <button className="modal-close" onClick={tryClose} aria-label={t.close}>
                &times;
              </button>
            )}

            {/* Top bar: language toggle + progress dots */}
            {step < 5 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                {/* Language toggle */}
                <button
                  type="button"
                  onClick={toggleLang}
                  aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    fontWeight: lang === "en" ? 700 : 400,
                    color: lang === "en" ? "var(--accent)" : "var(--text-muted)",
                    letterSpacing: 1,
                    transition: "color 0.2s",
                  }}>
                    {t.langToggleEn}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>|</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: lang === "es" ? 700 : 400,
                    color: lang === "es" ? "var(--accent)" : "var(--text-muted)",
                    letterSpacing: 1,
                    transition: "color 0.2s",
                  }}>
                    {t.langToggleEs}
                  </span>
                </button>

                {/* Progress dots */}
                <div className="progress-dots" style={{ marginBottom: 0 }}>
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className={`progress-dot ${i === currentDot ? "active" : ""} ${i < currentDot ? "completed" : ""}`} />
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <ModalStep key="step1" direction={direction}>
                <div className="divider-text fade-in">{t.letsGetStarted}</div>

                <h1 className="sentence-heading">
                  {t.iAm}{" "}
                  <SentenceSelect
                    value={userTypeLabel}
                    onChange={(label) => {
                      // Map display label back to internal value
                      const internal = label === t.anIndividual ? "individual" : label === businessLabel ? "business" : label;
                      handleUserTypeChange(internal);
                    }}
                    options={[t.anIndividual, businessLabel]}
                    placeholder="select one"
                    ariaLabel="I am"
                    t={t}
                  />
                  {userType && (
                    <span className="fade-in">
                      {" "}{t.readyToExplore}
                    </span>
                  )}
                </h1>

                {userType && (
                  <div className="mt-8 fade-in">
                    <p className="divider-text" style={{ marginBottom: 16 }}>
                      {t.selectAllThatApply}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(isBusiness ? activeInsuranceTypesBusiness : INSURANCE_TYPES_INDIVIDUAL).map((type) => {
                        const selected = insuranceTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={selected}
                            aria-label={tLabel(t, type, insuranceTypeKeys)}
                            className={`pill-multi ${selected ? "selected pill-bounce" : ""}`}
                            onClick={() => toggleInsuranceType(type)}
                            onAnimationEnd={(e) => {
                              // Remove bounce class after animation so it can re-trigger
                              (e.currentTarget as HTMLButtonElement).classList.remove("pill-bounce");
                            }}
                          >
                            {selected && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}
                                aria-hidden="true"
                              >
                                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {tLabel(t, type, insuranceTypeKeys)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sentenceComplete && (
                  <div className="mt-10 fade-in">
                    <button
                      className="btn-primary"
                      aria-label={t.continue}
                      onClick={nextStep}
                    >
                      {t.continue}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 2 && (
              <ModalStep key="step2" direction={direction}>
                <button onClick={prevStep} className="back-btn" aria-label={t.back}>{t.back}</button>
                <div className="divider-text fade-in">{t.tellUsAboutYourself}</div>

                <h1 className="sentence-heading">
                  {t.myFirstNameIs}{" "}
                  <InlineInput
                    value={firstName}
                    onChange={setFirstName}
                    placeholder={t.firstName}
                    autoFocus
                    ariaLabel="First name"
                    autoComplete="given-name"
                  />
                  {firstName.trim().length > 0 && (
                    <span className="fade-in">
                      {" "}{t.andMyLastNameIs}{" "}
                      <InlineInput
                        value={lastName}
                        onChange={setLastName}
                        placeholder={t.lastName}
                        ariaLabel="Last name"
                        autoComplete="family-name"
                      />
                    </span>
                  )}
                  {lastName.trim().length > 0 && (
                    <span className="fade-in">
                      {t.iNeedCoverageIn}{" "}
                      <InlineInput
                        value={city}
                        onChange={setCity}
                        placeholder={t.city}
                        ariaLabel="City"
                        autoComplete="address-level2"
                      />
                      ,{" "}
                      <SentenceSelect
                        value={state}
                        onChange={setState}
                        options={US_STATES}
                        placeholder={t.state}
                        searchable
                        ariaLabel="State"
                        t={t}
                      />
                    </span>
                  )}
                  .
                </h1>

                {personalComplete && (
                  <div className="mt-10 fade-in">
                    <button
                      className="btn-primary"
                      aria-label={t.continue}
                      onClick={nextStep}
                    >
                      {t.continue}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 3 && (
              <ModalStep key="step3" direction={direction}>
                <button onClick={prevStep} className="back-btn" aria-label={t.back}>{t.back}</button>
                <div className="divider-text fade-in">{t.aboutYourBusiness}</div>

                <h1 className="sentence-heading">
                  {t.myBusinessIsIn}{" "}
                  <SentenceSelect
                    value={industry}
                    onChange={setIndustry}
                    options={activeIndustries}
                    placeholder={industryLabelText}
                    ariaLabel="Industry"
                    t={t}
                    labelMap={(v) => tLabel(t, v, industryKeys)}
                  />
                  {industry && (
                    <span className="fade-in">
                      {" "}{t.with}{" "}
                      <SentenceSelect
                        value={employeeCount}
                        onChange={setEmployeeCount}
                        options={activeEmployeeCounts}
                        placeholder={t.count}
                        ariaLabel="Employee count"
                        t={t}
                      />
                      {" "}{employeeLabelText}
                    </span>
                  )}
                </h1>

                {businessComplete && vertical && vConfig && (
                  <div className="mt-8 fade-in">
                    <p className="divider-text" style={{ marginBottom: 16 }}>
                      {t.selectAllThatApply}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activeInsuranceTypesBusiness.map((type) => {
                        const selected = insuranceTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={selected}
                            aria-label={type}
                            className={`pill-multi ${selected ? "selected pill-bounce" : ""}`}
                            onClick={() => toggleInsuranceType(type)}
                            onAnimationEnd={(e) => {
                              (e.currentTarget as HTMLButtonElement).classList.remove("pill-bounce");
                            }}
                          >
                            {selected && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}
                                aria-hidden="true"
                              >
                                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {businessComplete && (
                  <div className="mt-10 fade-in">
                    <button
                      className="btn-primary"
                      aria-label={t.continue}
                      onClick={nextStep}
                    >
                      {t.continue}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 4 && (
              <ModalStep key="step4" direction={direction}>
                <button onClick={prevStep} className="back-btn" aria-label={t.back}>{t.back}</button>
                <div className="divider-text fade-in">{t.almostDone}</div>

                <h1 className="sentence-heading">
                  {t.reachMeAt}{" "}
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder={t.phonePlaceholder}
                    autoFocus
                    onBlur={() => setPhoneTouched(true)}
                    ariaLabel="Phone number"
                    autoComplete="tel-national"
                    ariaDescribedBy={phoneTouched && phone.length > 0 && !phoneValid ? "ifw-phone-error" : undefined}
                  />
                  {phoneValid && (
                    <span className="fade-in">
                      {" "}{t.or}{" "}
                      <InlineInput
                        value={email}
                        onChange={setEmail}
                        placeholder={t.emailPlaceholder}
                        type="email"
                        onBlur={() => setEmailTouched(true)}
                        ariaLabel="Email address"
                        autoComplete="email"
                        ariaDescribedBy={emailTouched && email.trim().length > 0 && !emailValid ? "ifw-email-error" : undefined}
                      />
                      .
                    </span>
                  )}
                </h1>

                {phoneTouched && phone.length > 0 && !phoneValid && (
                  <p id="ifw-phone-error" className="text-sm text-orange-300 mt-3 fade-in" role="alert">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}>
                      <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    {t.phoneError}
                  </p>
                )}
                {emailTouched && email.trim().length > 0 && !emailValid && (
                  <p id="ifw-email-error" className="text-sm text-orange-300 mt-1 fade-in" role="alert">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}>
                      <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    {t.emailError}
                  </p>
                )}

                {contactComplete && (
                  <div className="mt-8 fade-in">
                    <p className="text-lg font-light mb-4" style={{ color: "var(--text-muted)" }}>
                      {t.anythingElse}
                    </p>
                    <textarea
                      className="comments-field"
                      rows={3}
                      placeholder={t.typeYourMessage}
                      value={comments}
                      onChange={(e) => setComments(e.target.value.slice(0, 500))}
                      maxLength={500}
                      aria-label="Additional comments"
                    />
                    <div style={{ fontSize: 13, marginTop: 8, color: comments.length >= 475 ? "#fbbf24" : "var(--text-muted)", transition: "color 0.2s ease" }}>
                      {comments.length} / 500
                    </div>
                  </div>
                )}

                {submitError && contactComplete && (
                  <div className="submit-error fade-in" role="alert" style={{ marginTop: 20 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    <span>{t.submitError}</span>
                    <button type="button" className="submit-error-retry" onClick={handleSubmit}>
                      {t.tryAgain}
                    </button>
                  </div>
                )}

                {contactComplete && (
                  <div className="mt-8 fade-in">
                    <button
                      className="btn-primary"
                      onClick={handleSubmit}
                      disabled={submitting}
                      aria-label={submitting ? t.submitting : t.submit}
                    >
                      {submitting && <span className="spinner" />}
                      {submitting ? t.submitting : t.submit}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 5 && (
              <ModalStep key="step5" direction="forward">
                <Confetti />
                <div className="text-center py-10" style={{ position: "relative" }}>
                  <div className="text-6xl mb-6 fade-in">&#127881;</div>
                  <h1 className="sentence-heading mb-4 fade-in">
                    {t.allSet}, {firstName}!
                  </h1>
                  <p className="text-xl font-light fade-in" style={{ color: "var(--text-muted)", animationDelay: "0.5s", animationFillMode: "both" }}>
                    {t.weReceived}
                  </p>
                  <div className="mt-8 fade-in" style={{ animationDelay: "0.8s", animationFillMode: "both", display: "flex", gap: 12, justifyContent: "center" }}>
                    <button
                      className="btn-primary"
                      aria-label={t.done}
                      onClick={() => { setModalOpen(false); try { window.parent.postMessage('insurance-form-close', '*'); } catch {} }}
                    >
                      {t.done}
                    </button>
                    <button
                      className="confirm-leave"
                      aria-label={t.startOver}
                      onClick={handleStartOver}
                    >
                      {t.startOver}
                    </button>
                  </div>
                </div>
              </ModalStep>
            )}

            {/* Confirm close dialog */}
            {showConfirm && (
              <div className="confirm-overlay" role="alertdialog" aria-modal="true" aria-label="Confirm close">
                <div className="confirm-card">
                  <h3 className="text-xl font-semibold mb-2">{t.closeTheForm}</h3>
                  <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                    {t.progressSaved}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button className="confirm-stay" aria-label={t.stay} onClick={() => setShowConfirm(false)}>{t.stay}</button>
                    <button className="confirm-leave" aria-label={t.close} onClick={confirmClose}>{t.close}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global pill-bounce keyframes injected once */}
      <style>{`
        @keyframes pillBounce {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          70%  { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
        .pill-bounce {
          animation: pillBounce 0.32s ease-out !important;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Modal Step Wrapper (slide animation)
// ============================================================

function ModalStep({ children, direction }: { children: React.ReactNode; direction: "forward" | "back" }) {
  const [show, setShow] = useState(false);
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;
  useEffect(() => { setShow(true); }, []);
  if (prefersReduced) return <div>{children}</div>;
  const startX = direction === "forward" ? 40 : -40;
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateX(0)" : `translateX(${startX}px)`,
      transition: "all 0.4s ease",
    }}>
      {children}
    </div>
  );
}

// ============================================================
// Custom Dropdown
// ============================================================

function SentenceSelect({
  value, onChange, options, placeholder, searchable = false, ariaLabel, t, labelMap,
}: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; searchable?: boolean; ariaLabel?: string;
  t: (typeof i18n)[Lang]; labelMap?: (v: string) => string;
}) {
  const getLabel = labelMap ?? ((v: string) => v);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const idPrefix = useRef(`ifw-${Math.random().toString(36).slice(2, 7)}`).current;

  const closeAndFocus = () => { setOpen(false); setTimeout(() => triggerRef.current?.focus(), 0); };

  const filtered = searchable && search
    ? options.filter((o) => getLabel(o).toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => { setHighlightedIndex(-1); }, [search]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        closeAndFocus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { closeAndFocus(); return; }
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          e.preventDefault();
          e.stopPropagation();
          onChange(filtered[highlightedIndex]);
          closeAndFocus();
        } else if (filtered.length === 1) {
          e.preventDefault();
          e.stopPropagation();
          onChange(filtered[0]);
          closeAndFocus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, highlightedIndex, onChange]);

  useEffect(() => {
    if (!open) { setSearch(""); setHighlightedIndex(-1); return; }
    if (searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  // Close on scroll outside dropdown
  useEffect(() => {
    if (!open) return;
    const handleScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownMaxH = 260;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;

      let top: number;
      if (spaceBelow >= dropdownMaxH || spaceBelow >= spaceAbove) {
        top = rect.bottom + 8;
      } else {
        top = Math.max(8, rect.top - 8 - Math.min(dropdownMaxH, spaceAbove));
      }

      let left = rect.left;
      if (left + 220 > window.innerWidth) left = window.innerWidth - 228;
      if (left < 8) left = 8;

      setPos({ top, left });
    }
  }, [open]);

  return (
    <span style={{ display: "inline", verticalAlign: "baseline" }}>
      <button
        ref={triggerRef}
        type="button"
        className={`custom-select-trigger ${value ? "has-value" : ""}`}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {value ? getLabel(value) : placeholder}
        <svg className="custom-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="custom-select-dropdown"
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          aria-activedescendant={highlightedIndex >= 0 ? `${idPrefix}-${highlightedIndex}` : undefined}
          style={{ position: "fixed", top: pos.top, left: pos.left, maxHeight: Math.min(260, window.innerHeight - pos.top - 8) }}
        >
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className="custom-select-search"
              placeholder={t.typeToSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search options"
            />
          )}
          {filtered.map((opt, idx) => (
            <button
              key={opt}
              type="button"
              role="option"
              id={`${idPrefix}-${idx}`}
              aria-selected={value === opt}
              className={`custom-select-option ${value === opt ? "active" : ""} ${idx === highlightedIndex ? "highlighted" : ""}`}
              onClick={() => { onChange(opt); closeAndFocus(); }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              ref={(el) => { if (idx === highlightedIndex && el) el.scrollIntoView({ block: "nearest" }); }}
            >
              {getLabel(opt)}
            </button>
          ))}
          {searchable && filtered.length === 0 && (
            <div className="custom-select-empty">{t.noResults}</div>
          )}
        </div>,
        document.body,
      )}
    </span>
  );
}

// ============================================================
// Shared Components
// ============================================================

function useTextWidth(text: string) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>(0);
  useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.scrollWidth);
  }, [text]);
  return { ref, width };
}

function InlineInput({
  value, onChange, placeholder, type = "text", autoFocus = false, onBlur, ariaLabel, autoComplete, ariaDescribedBy,
}: {
  value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; autoFocus?: boolean;
  onBlur?: () => void; ariaLabel?: string; autoComplete?: string; ariaDescribedBy?: string;
}) {
  const display = value || placeholder;
  const { ref: sizerRef, width } = useTextWidth(display);
  return (
    <>
      <span ref={sizerRef} className="text-field text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type={type}
        className={`text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? placeholder}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
      />
    </>
  );
}

function PhoneInput({
  value, onChange, autoFocus = false, placeholder = "(555) 123-4567", onBlur, ariaLabel, autoComplete, ariaDescribedBy,
}: {
  value: string; onChange: (v: string) => void; autoFocus?: boolean;
  placeholder?: string; onBlur?: () => void; ariaLabel?: string; autoComplete?: string; ariaDescribedBy?: string;
}) {
  const formatPhone = (digits: string) => {
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const displayValue = value ? formatPhone(value) : "";
  const display = displayValue || placeholder;
  const { ref: sizerRef, width } = useTextWidth(display);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  return (
    <>
      <span ref={sizerRef} className="text-field text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type="tel"
        inputMode="numeric"
        className={`text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? "Phone number"}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
      />
    </>
  );
}
