import { LitElement, html, unsafeCSS } from "lit";
import { loadStripe } from "@stripe/stripe-js";

class PremiumBookingWidget extends LitElement {
  couponCode = "";
  couponStatus = null; // { valid: true/false, message: '', discountPercent: 0 }
  discountPercent = 0;
  discountedTotal = null;
  static properties = {
    widgetId: { type: String },
    color: { type: String },
    loading: { type: Boolean },
    stripeConfig: { type: Object },
    services: { type: Object }, // Map
    globalAdditionalServices: { type: Array },
    squareFootagePricing: { type: Array },
    selectedService: { type: Object },
    selectedExtras: { type: Array },
    selectedSquareFootage: { type: Object },
    currentStep: { type: Number },
    showServiceDetails: { type: Boolean },
    paymentProcessing: { type: Boolean },
    paymentError: { type: String },
    bookingData: { type: Object },
    cardData: { type: Object },
    businessHours: { type: Object },
    formError: { type: String },
  };


  constructor() {
    super();
    this.widgetId = "";
    this.color = "#6366f1";
    this.loading = false;
    this.stripeConfig = null;
    this.services = new Map();
    this.globalAdditionalServices = [];
    this.squareFootagePricing = [];
    this.selectedService = null;
    this.selectedExtras = [];
    this.selectedSquareFootage = null;
    this.currentStep = 1;
    this.showServiceDetails = false;
    this.paymentProcessing = false;
    this.paymentError = "";
    this.bookingData = {
      serviceInfo: null,
      schedule: { date: "", time: "", frequency: "one-time", notes: "" },
      generalInfo: {
        name: "",
        email: "",
        phone: "",
        address: "",
        postalCode: "",
        state: "",
      },
      payment: { method: "card" },
      additionalData: [],
    };
    this.cardData = {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    };
    // Opciones de tipos de baño (en inglés)
    this.bathroomOptions = [
      {
        label: "Full bathroom (sink + toilet + shower and/or tub)",
        value: "full_bathroom",
      },
      {
        label: "Powder room (sink + toilet)",
        value: "powder_room",
      },
      {
        label: "Master bath (usually larger, often with double sink)",
        value: "master_bath",
      },
      {
        label: "Guest bath",
        value: "guest_bath",
      },
      {
        label: "En suite bath (connected to bedroom)",
        value: "en_suite_bath",
      },
      {
        label: "Staff bath",
        value: "staff_bath",
      },
      {
        label: "Pool bath (next to pool or outdoor area)",
        value: "pool_bath",
      },
    ];
    this.selectedBathrooms = [];
    this.selectedBathroom = "";
    this.apiSecret = "booking-d9e180f3-d77d-4c25-a163-4605c8ddfb48";
    this.businessHours = {
      start: 7, // 7 AM
      end: 17, // 5 PM (formato 24h)
    };
    this.formError = "";
  }


  handleBathroomRadio(e) {
    const { value } = e.target;
    this.selectedBathroom = value;
    // Buscar el label (texto) correspondiente al value seleccionado
    const selectedOption = this.bathroomOptions.find(opt => opt.value === value);
    const label = selectedOption ? selectedOption.label : value;
    // Guardar en bookingData.additionalData el label (texto)
    this.bookingData = {
      ...this.bookingData,
      additionalData: label,
    };
    // LOGO en consola para ver en tiempo real los items seleccionados
    console.log('🛁 [BathroomType Selected]', {
      selectedBathroom: value,
      additionalData: this.bookingData.additionalData,
    });
    this.requestUpdate();
  }

  createRenderRoot() {
    return this; // Renderiza en el light DOM, no shadow DOM
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupGlobalStyles();
    this.fetchBookingSettings().then(() => this.initializeStripe());
  }

  setupGlobalStyles() {
    if (!document.getElementById("booking-widget-global-styles")) {
      const style = document.createElement("style");
      style.id = "booking-widget-global-styles";

      // Solo definimos las variables CSS aquí, sin valores iniciales
      style.textContent = `
        :root {
          --primary-color: #6366f1;
          --primary-light: #a5b4fc;
          --primary-dark: #4f46e5;
          --text-color: #1e293b;
          --light-gray: #f8fafc;
          --medium-gray: #e2e8f0;
          --dark-gray: #94a3b8;
          --success-color: rgb(2, 148, 46);
          --error-color: #ef4444;
          --border-radius: 12px;
          --box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                        0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --transition: all 0.3s ease;
        }
        
        /* Todos tus otros estilos CSS aquí */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          color: var(--text-color);
        }
        
        * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      color: var(--text-color);
    }

    h1,
    h2,
    h3,
    h4 {
      text-align: center;
      margin-bottom: 1.5rem;
      font-weight: 600;
      color: var(--primary-dark);
    }

    h3 {
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    /* Step Indicator */
    .step-indicator {
      display: flex;
      justify-content: center;
      margin-bottom: 3rem;
      position: relative;
    }

    .step-progress {
      position: absolute;
      top: 15px;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--medium-gray);
      z-index: 1;
    }

    .step-progress-bar {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .steps-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
      position: relative;
      z-index: 2;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--medium-gray);
      color: var(--text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      font-weight: 500;
      border: 3px solid white;
    }

    .step.active .step-number {
      background-color: var(--primary-color);
      color: white;
    }

    .step.completed .step-number {
      background-color: var(--success-color);
      color: white;
    }

    .step-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--dark-gray);
      text-align: center;
      max-width: 80px;
    }

    .step.active .step-label,
    .step.completed .step-label {
      color: var(--text-color);
      font-weight: 600;
    }

    /* Service Cards */
    .selection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .service-card {
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      padding: 1rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .service-card.selected {
      /* Estilos para la tarjeta seleccionada */
      border-color: #1976d2; /* ejemplo: azul primario */
      background: #e3f2fd; /* ejemplo: azul muy claro de fondo */
      /* Puedes ajustar colores/borde según tu diseño, o usar variables CSS compartidas */
    }

    .service-card:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .service-card.selected::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-color);
    }

    .card-header {
      padding: 1.5rem;
      text-align: center;
      border-bottom: 1px solid var(--medium-gray);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--primary-dark);
    }

    .card-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 1rem 0;
    }

    .card-body {
      padding: 1.5rem;
    }

    .benefits-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .benefits-list li {
      position: relative;
      padding-left: 1.75rem;
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }

    .benefits-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--success-color);
      font-weight: bold;
    }

    .size-selection select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      font-size: 1rem;
      transition: var(--transition);
    }
    .size-selection select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .card-content {
      padding: 1rem;
    }
    .extra-item img {
      flex-shrink: 0;
    }
    .service-card {
      position: relative;
    }

    .img-services {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: var(--border-radius);
    }
    .img-extras {
      width: 64px;
      height: 64px;
      object-fit: contain;
      display: block;
      margin: 0 auto;
      border-radius: var(--border-radius);
    }

    /* Service Details */
    .service-details-container {
      background: white;
      border-radius: var(--border-radius);
      padding: 2rem;
      margin-top: 2rem;
      box-shadow: var(--box-shadow);
    }

    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .details-header h3 {
      margin: 0;
      text-align: left;
    }

    .back-button {
      background: none;
      border: none;
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Size Selection */
    .size-selection {
      margin-bottom: 2rem;
    }

    .size-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .size-option {
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      padding: 1rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .size-option:hover {
      border-color: var(--primary-light);
    }

    .size-option.selected {
      border: 2px solid var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      background-color: rgba(99, 102, 241, 0.05);
    }

    .size-range {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .size-price {
      color: var(--primary-color);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .size-time {
      color: var(--dark-gray);
      font-size: 0.875rem;
    }

    /* Extras Section */
    .extras-section {
      margin-bottom: 2rem;
    }

    .extras-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .extra-item {
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .extra-item:hover {
      border-color: var(--primary-light);
    }

    .extra-item.selected {
      border-color: var(--primary-color);
      background-color: rgba(99, 102, 241, 0.05);
    }

    .extra-item input {
      accent-color: var(--primary-color);
    }

    .extra-price {
      margin-left: auto;
      font-weight: 600;
      color: var(--primary-color);
    }

    .extra-time {
      color: var(--dark-gray);
      font-size: 0.875rem;
    }

    /* Summary Card */
    .summary-card {
      background: white;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-top: 2rem;
      box-shadow: var(--box-shadow);
      border-top: 4px solid var(--primary-color);
    }

    .summary-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--primary-dark);
      text-align: center;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--medium-gray);
    }

    .summary-total {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--primary-dark);
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--medium-gray);
    }

    /* Buttons */
    .confirm-button {
      width: 100%;
      padding: 1rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: var(--transition);
      margin-top: 2rem;
    }

    .confirm-button:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }

    /* Form Styles */
    .form-container {
      background: white;
      border-radius: var(--border-radius);
      padding: 2rem;
      box-shadow: var(--box-shadow);
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-color);
    }

    input,
    select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      font-size: 1rem;
      transition: var(--transition);
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    /* Navigation Buttons */
    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      font-weight: 500;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    button:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
    }

    button:disabled {
      background-color: var(--dark-gray);
      cursor: not-allowed;
      transform: none;
      opacity: 0.7;
    }

    button.secondary {
      background-color: white;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }

    button.secondary:hover {
      background-color: var(--light-gray);
    }

    /* Confirmation */
    .confirmation-container {
      background: white;
      border-radius: var(--border-radius);
      padding: 3rem;
      text-align: center;
      box-shadow: var(--box-shadow);
      max-width: 600px;
      margin: 0 auto;
    }

    .confirmation-icon {
      font-size: 4rem;
      color: var(--success-color);
      margin-bottom: 1.5rem;
    }

    .confirmation-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--primary-dark);
    }

    .confirmation-message {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      line-height: 1.6;
      color: var(--text-color);
    }

    .error-message {
      color: var(--error-color);
      font-weight: 500;
      font-size: 1.2rem;
      margin-top: 2rem;
      margin-bottom: 2rem;
      text-align: center;
      
    }

    /* Payment Section Styles */
    .payment-section {
      background: white;
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--box-shadow);
      border: 1px solid var(--medium-gray);
    }

    .payment-section-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .payment-icon {
      width: 40px;
      height: 40px;
      background-color: var(--primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      color: var(--primary-dark);
      font-size: 1.25rem;
    }

    .payment-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-dark);
    }

    .payment-methods {
      margin-top: 1.5rem;
    }

    .payment-method {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      margin-bottom: 0.75rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .payment-method:hover {
      border-color: var(--primary-color);
    }

    .payment-method.selected {
      border: 2px solid var(--primary-color);
      background-color: rgba(99, 102, 241, 0.05);
    }

    .payment-method-icon {
      width: 30px;
      height: 30px;
      margin-right: 1rem;
      color: var(--primary-color);
    }

    .payment-method-info {
      flex-grow: 1;
    }

    .payment-method-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .payment-method-description {
      font-size: 0.875rem;
      color: var(--dark-gray);
    }

    /* Stripe Element Styles */
    #card-element-container {
      margin: 1.5rem 0;
    }

    #card-element {
      border: 1px solid var(--medium-gray);
      border-radius: var(--border-radius);
      padding: 12px;
      background: white;
      transition: var(--transition);
    }

    #card-element.StripeElement--focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color);
    }

    #card-element.StripeElement--invalid {
      border-color: var(--error-color);
    }

    #card-element.StripeElement--complete {
      border-color: var(--success-color);
    }

    .card-hint {
      font-size: 0.875rem;
      color: var(--dark-gray);
      margin-top: 0.5rem;
      text-align: center;
    }

    /* Loading State */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--primary-light);
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .selection-grid,
      .size-options,
      .extras-grid {
        grid-template-columns: 1fr;
      }

      .details-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .step-label {
        display: none;
      }
      `;

      document.head.appendChild(style);
    }
  }

  updateGlobalStyles() {
    const style = document.getElementById("booking-widget-global-styles");
    if (style) {
      // Actualizamos solo las variables de color
      const updatedStyles = style.textContent
        .replace(/--primary-color:.*?;/g, `--primary-color: ${this.color};`)
        .replace(
          /--primary-light:.*?;/g,
          `--primary-light: ${this.adjustColor(this.color, 20)};`
        )
        .replace(
          /--primary-dark:.*?;/g,
          `--primary-dark: ${this.adjustColor(this.color, -20)};`
        );

      style.textContent = updatedStyles;
    }
  }

  async initializeStripe() {
    // Verifica que se haya cargado la clave pública
    if (!this.stripeConfig?.publicKey) {
      console.error("Stripe public key is not provided");
      this.paymentError = "Stripe public key is missing.";
      return;
    }

    try {
      // Cargar Stripe de manera asíncrona
      this.stripe = await loadStripe(this.stripeConfig.publicKey, {
        locale: "en", // Fuerza el idioma inglés
      });

      // Verificar que Stripe se haya cargado correctamente
      if (!this.stripe) {
        throw new Error("Failed to initialize Stripe.");
      }

      console.log("Stripe has been successfully initialized.");
    } catch (error) {
      console.error("Error loading Stripe:", error);
      this.paymentError =
        "Failed to initialize Stripe. Please try again later.";
    }
  }

  async setupStripeElement() {
    // Only set up the element for the payment step (step 4)
    if (this.currentStep !== 4 || this.cardElement) return;

    // Wait for the component to fully update
    await this.updateComplete;

    // Mount Stripe element for payment step
    const container = this.renderRoot?.querySelector("#card-element");
    if (!container) {
      setTimeout(() => this.setupStripeElement(), 100);
      return;
    }

    const elements = this.stripe.elements();
    const style = {
      base: {
        color: "#32325d",
        fontFamily: '"Inter", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    };

    // Create and mount the Stripe card element
    this.cardElement = elements.create("card", { style });
    this.cardElement.mount(container);

    // Handle any element changes
    this.cardElement.on("change", (event) => {
      this.paymentError = event.error?.message || "";
      this.requestUpdate();
    });
  }

  // Use updated lifecycle method to re-mount the card element if needed
  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has("currentStep")) {
      if (this.currentStep === 4) {
        this.setupStripeElement(); // Mount card element on payment step
      } else {
        // Optionally unmount if navigating away from payment step
        if (this.cardElement) {
          this.cardElement.unmount();
          this.cardElement = null;
        }
      }
    }
  }

  async firstUpdated() {
    //cargar los colores
    this.applyDynamicColor();
    setTimeout(() => {
      this.setupStripeElement();
    }, 100);
  }

  async fetchBookingSettings() {
    this.loading = true;
    try {
      const response = await fetch(
        `http://localhost:3000/api/booking/settings/byAppId?appId=${this.widgetId}`,
        {
          headers: { "x-api-secret": this.apiSecret },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Aquí es donde se obtiene la clave pública de Stripe
      this.stripeConfig = data.stripe || {};
      if (!this.stripeConfig.publicKey) {
        console.error("Stripe public key is missing in the response data.");
        this.paymentError = "Stripe public key is missing.";
      }

      // Actualizar el color
      this.color = data.color || "#6366f1";
      this.applyDynamicColor();

      // Actualizar las variables CSS en el documento
      this.updateGlobalStyles();
      this.services = new Map(
        Object.entries(data.services || {}).map(([id, service]) => [
          id,
          { id, ...service },
        ])
      );
      this.globalAdditionalServices = data.globalAdditionalServices || [];
      this.squareFootagePricing = data.squareFootagePricing || [];
    } catch (error) {
      console.error("Failed to load booking settings:", error);
    } finally {
      this.loading = false;
    }
  }

  handleServiceSelect(serviceId) {
    const service = this.services.get(serviceId);
    this.selectedService = { id: serviceId, ...service };
    this.selectedExtras = [];
    this.selectedSquareFootage = null;
    this.showServiceDetails = true;

    // Esperar a que se rendericen los detalles y hacer scroll
    setTimeout(() => {
      const sizeSection = document.getElementById("size-selection");
      if (sizeSection) {
        sizeSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100); // pequeño retraso para asegurar renderizado
  }

  toggleExtra(extra) {
    const exists = this.selectedExtras.some((e) => e.name === extra.name);
    this.selectedExtras = exists
      ? this.selectedExtras.filter((e) => e.name !== extra.name)
      : [...this.selectedExtras, extra];
  }

  selectSquareFootage(size) {
    this.selectedSquareFootage = size;
  }

  confirmServiceSelection() {
    this.bookingData.serviceInfo = {
      service: this.selectedService,
      extras: this.selectedExtras,
      squareFootage: this.selectedSquareFootage,
      subtotal: this.subtotal,
      total: this.total,
    };
    // Guardar el label del baño seleccionado en additionalData
    const selectedOption = this.bathroomOptions.find(opt => opt.value === this.selectedBathroom);
    const label = selectedOption ? selectedOption.label : this.selectedBathroom;
    this.bookingData.additionalData = label;
    this.showServiceDetails = false;
    this.nextStep();
  }

  formatMinutesToHours(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  get subtotal() {
    let basePrice =
      (this.selectedService?.price || 0) +
      (this.selectedSquareFootage?.price || 0);

    return (
      basePrice +
      this.selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0)
    );
  }

  get total() {
    return this.subtotal; // Could add taxes or discounts here
  }

  async nextStep() {
    this.formError = "";

    if (this.currentStep === 2) {
      const { date, time, frequency } = this.bookingData.schedule;
      if (!date || !time || !frequency) {
        this.formError = "Please select a date, time, and frequency.";
        return;
      }
    }

    if (this.currentStep === 3) {
      const info = this.bookingData.generalInfo;
      const allFieldsFilled = [
        "name",
        "email",
        "phone",
        "address",
        "postalCode",
        "state",
      ].every((field) => info[field]?.trim());
      if (!allFieldsFilled) {
        this.formError = "Please fill in all personal details.";
        return;
      }
    }

    if (this.currentStep < 5) {
      this.currentStep++;
      await this.updateComplete; // Esperar a que se complete la actualización
      this.scrollToStepTop();
      // Reset coupon info when entering payment step
      if (this.currentStep === 4) {
        this.couponCode = "";
        this.couponStatus = null;
        this.discountPercent = 0;
        this.discountedTotal = null;
      }
    }
  }

  handleCouponInput(e) {
    this.couponCode = e.target.value;
    this.couponStatus = null;
  }

  async validateCoupon() {
    this.couponStatus = null;
    if (!this.couponCode || !this.bookingData?.serviceInfo?.total) {
      this.couponStatus = { valid: false, message: "Enter a coupon code." };
      await this.requestUpdate();
      return;
    }
    try {
      const code = encodeURIComponent(this.couponCode.trim());
      const amount = this.bookingData.serviceInfo.total;
      const clientId = this.widgetId;
      const url = `http://localhost:3000/api/coupons/validate/${code}?amount=${amount}&clientId=${clientId}`;
      const res = await fetch(url, {
        headers: { "x-api-secret": this.apiSecret },
      });
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
      if (!res.ok || !data.valid) {
        // Mostrar siempre el mensaje de error del backend si existe
        this.couponStatus = { valid: false, message: (data && data.error) ? data.error : (res.status === 404 ? "Coupon not found for this client" : "Invalid coupon.") };
        this.discountPercent = 0;
        this.discountedTotal = null;
        await this.requestUpdate();
        return;
      }
      this.discountPercent = data.discountPercent;
      // Calcular el nuevo total con descuento
      const total = this.bookingData.serviceInfo.total;
      const discount = (total * this.discountPercent) / 100;
      this.discountedTotal = Math.max(0, total - discount);
      this.couponStatus = { valid: true, message: `Coupon applied! ${this.discountPercent}% off.` };
    } catch (err) {
      this.couponStatus = { valid: false, message: "Error validating coupon." };
      this.discountPercent = 0;
      this.discountedTotal = null;
    }
    await this.requestUpdate();
  }

  async prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      await this.updateComplete; // Esperar a que se complete la actualización
      this.scrollToStepTop();
    }
  }

  async scrollToStepTop() {
    try {
      await this.updateComplete;

      const stepId = `step-${this.currentStep}`;
      const stepElement = document.getElementById(stepId);

      if (!stepElement) {
        console.warn(`No se encontró el elemento con ID: ${stepId}`);
        return;
      }

      // 1. Intentar con scrollIntoView y luego ajustar el scroll
      stepElement.scrollIntoView({ behavior: "smooth", block: "start" });

      // 2. Esperar un momento y luego ajustar con margen de 100px
      await new Promise((resolve) => setTimeout(resolve, 100));

      const desiredOffset = 100;
      const currentTop = stepElement.getBoundingClientRect().top;

      // 3. Verificar si necesita ajuste
      if (currentTop > desiredOffset + 10 || currentTop < desiredOffset - 10) {
        const scrollPos = window.scrollY + currentTop - desiredOffset;

        const htmlStyle = document.documentElement.style;
        const originalScrollBehavior = htmlStyle.scrollBehavior;
        htmlStyle.scrollBehavior = "auto";

        window.scrollTo(0, scrollPos);

        setTimeout(() => {
          htmlStyle.scrollBehavior = originalScrollBehavior;
        }, 50);
      }
    } catch (error) {
      console.error("Error en scrollToStepTop:", error);
    }
  }

  handleScheduleChange(e) {
    const { name, value } = e.target;
    this.bookingData.schedule = {
      ...this.bookingData.schedule,
      [name]: value,
    };
  }

  handleGeneralInfoChange(e) {
    const { name, value } = e.target;
    this.bookingData.generalInfo = {
      ...this.bookingData.generalInfo,
      [name]: value,
    };
  }

  handleCardChange(e) {
    const { name, value } = e.target;
    this.cardData = {
      ...this.cardData,
      [name]: value,
    };
  }

  // Ensuring cardElement is properly mounted
  async completeBooking() {
    this.paymentProcessing = true;
    this.paymentError = "";

    // Check if Stripe is properly initialized
    if (!this.stripe) {
      this.paymentError = "Stripe is not initialized.";
      this.paymentProcessing = false;
      return;
    }

    // Make sure the cardElement is mounted before proceeding
    if (!this.cardElement || this.cardElement._empty) {
      this.paymentError = "Please provide a valid card number.";
      this.paymentProcessing = false;
      return;
    }

    try {
      // Retrieve the payment method
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: "card",
        card: this.cardElement, // Ensure this is correctly referencing the mounted Element
        billing_details: {
          name: this.cardData.cardName,
          email: this.bookingData.generalInfo.email,
          address: {
            line1: this.bookingData.generalInfo.address,
            state: this.bookingData.generalInfo.state,
            postal_code: this.bookingData.generalInfo.postalCode,
          },
        },
      });

      if (error) {
        this.paymentError = error.message;
        throw new Error(error.message);
      }

      // Usar el total con descuento si existe
      const totalToCharge = this.discountedTotal !== null ? this.discountedTotal : this.bookingData.serviceInfo.total;

      // Proceed to backend payment processing
      const bookingRequest = {
        bookingData: {
          appId: this.widgetId,
          services: {
            [this.bookingData.serviceInfo.service.id]: {
              name: this.bookingData.serviceInfo.service.name,
              price: this.bookingData.serviceInfo.service.price,
              additionalServices: this.bookingData.serviceInfo.extras,
              squareFootage: this.bookingData.serviceInfo.squareFootage,
            },
          },
          subtotal: this.bookingData.serviceInfo.subtotal,
          total: totalToCharge,
          clientInfo: this.bookingData.generalInfo,
          schedule: this.bookingData.schedule,
        },
        paymentData: {
          paymentMethodId: paymentMethod.id,
          currency: "usd",
          returnUrl: `${window.location.origin}/confirmation`,
        },
      };

      // Send request to backend
      const response = await fetch(
        "http://localhost:3000/api/booking/create-and-pay",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-secret": this.apiSecret,
          },
          body: JSON.stringify(bookingRequest),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error processing the payment");
      }

      // If payment succeeds
      if (
        data.payment.status === "succeeded" ||
        data.payment.status === "requires_capture"
      ) {
        this.bookingData.confirmation = {
          bookingId: data.booking._id,
          paymentId: data.payment.paymentIntentId,
        };
        this.nextStep();
      } else {
        throw new Error("Payment failed.");
      }
    } catch (error) {
      console.error("Error in completeBooking:", error);
      this.paymentError = error.message || "Error processing payment";
    } finally {
      this.paymentProcessing = false;
    }
  }

  resetBooking() {
    this.currentStep = 1;
    this.selectedService = null;
    this.selectedExtras = [];
    this.selectedSquareFootage = null;
    this.selectedBathrooms = [];
    this.selectedBathroom = "";
    this.showServiceDetails = false;
    this.cardData = {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    };
    this.bookingData = {
      serviceInfo: null,
      schedule: { date: "", time: "", frequency: "one-time", notes: "" },
      generalInfo: {
        name: "",
        email: "",
        phone: "",
        address: "",
        postalCode: "",
        state: "",
      },
      payment: { method: "card" },
      additionalData: [],
    };
  }

  formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    e.target.value = value;
    this.cardData.cardNumber = value;
  }

  formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
    this.cardData.expiryDate = value;
  }

  adjustColor(color, amount) {
    if (!color || color[0] !== "#") return color;

    color = color.replace("#", "");
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    let r = parseInt(color.substr(0, 2), 16);
    let g = parseInt(color.substr(2, 2), 16);
    let b = parseInt(color.substr(4, 2), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    const rr = r.toString(16).padStart(2, "0");
    const gg = g.toString(16).padStart(2, "0");
    const bb = b.toString(16).padStart(2, "0");

    return `#${rr}${gg}${bb}`;
  }

  updated(changedProperties) {
    if (changedProperties.has("color")) {
      this.applyDynamicColor();
    }
  }

  applyDynamicColor() {
    this.style.setProperty("--primary-color", this.color);
    this.style.setProperty("--primary-light", this.adjustColor(this.color, 20));
    this.style.setProperty("--primary-dark", this.adjustColor(this.color, -20));
  }

  render() {
    return html`
      <style>
        :host {
          --primary-color: ${unsafeCSS(this.color)};
          --primary-light: ${unsafeCSS(this.adjustColor(this.color, 20))};
          --primary-dark: ${unsafeCSS(this.adjustColor(this.color, -20))};
        }

        .step-progress-bar {
          width: ${(this.currentStep - 1) * 25}%;
        }
      </style>

      <div class="container">
        <style>
          .step-progress-bar {
            width: ${(this.currentStep - 1) * 25}%;
            background-color: var(--primary-color);
          }
        </style>
        <div class="step-indicator">
          <div class="step-progress">
            <div class="step-progress-bar"></div>
          </div>
          <div class="steps-container">
            <div
              class="step ${this.currentStep >= 1
                ? this.currentStep > 1
                  ? "completed"
                  : "active"
                : ""}"
            >
              <div class="step-number">1</div>
              <div class="step-label">Service</div>
            </div>
            <div
              class="step ${this.currentStep >= 2
                ? this.currentStep > 2
                  ? "completed"
                  : "active"
                : ""}"
            >
              <div class="step-number">2</div>
              <div class="step-label">Schedule</div>
            </div>
            <div
              class="step ${this.currentStep >= 3
                ? this.currentStep > 3
                  ? "completed"
                  : "active"
                : ""}"
            >
              <div class="step-number">3</div>
              <div class="step-label">Details</div>
            </div>
            <div
              class="step ${this.currentStep >= 4
                ? this.currentStep > 4
                  ? "completed"
                  : "active"
                : ""}"
            >
              <div class="step-number">4</div>
              <div class="step-label">Payment</div>
            </div>
          </div>
        </div>

        ${this.currentStep === 1 ? this.renderStep1() : ""}
        ${this.currentStep === 2 ? this.renderStep2() : ""}
        ${this.currentStep === 3 ? this.renderStep3() : ""}
        ${this.currentStep === 4 ? this.renderStep4() : ""}
        ${this.currentStep === 5 ? this.renderStep5() : ""}
      </div>
    `;
  }

  renderStep1() {
    return html`
      <div class="step-content" id="step-1">
        <h3>Choose Your Service</h3>
        ${this.loading
          ? html` <div class="loading"><div class="spinner"></div></div> `
          : html`
              <div class="size-options">
                ${Array.from(this.services.entries()).map(
                  ([id, service]) => html`
                    <div
                      class="service-card ${this.selectedService?.id ===
                      service.id
                        ? "selected"
                        : ""}"
                      @click=${() => this.handleServiceSelect(id)}
                    >
                      ${service.image
                        ? html`<img
                            src=${service.image}
                            alt=${service.name}
                            class="img-services"
                          />`
                        : ""}
                      <div class="size-range">${service.name}</div>
                      <div class="size-price">$${service.price}</div>
                      ${service.time
                        ? html`<div class="size-time">
                            ${this.formatMinutesToHours(service.time)}
                          </div>`
                        : ""}
                      ${
                        //si está seleccionado, mostrar selected
                        this.selectedService?.id === id
                          ? html`<div class="selected-indicator">✓</div>`
                          : ""
                      }
                    </div>
                  `
                )}
              </div>
            `}
        ${this.showServiceDetails && this.selectedService
          ? html`
              <div class="service-details-container">
                <div class="details-header">
                  <h3>${this.selectedService.name}</h3>
                  <button
                    @click=${() => (this.showServiceDetails = false)}
                    class="back-button"
                  >
                    &larr; Back to services
                  </button>
                </div>

                ${this.squareFootagePricing.length > 0
                  ? html`
                      <div class="size-selection" id="size-selection">
                        <h3>Select Property Size</h3>
                        <select
                          @change=${(e) =>
                            this.selectSquareFootage(
                              this.squareFootagePricing.find(
                                (s) => s.range === e.target.value
                              )
                            )}
                        >
                          <option value="">-- Select size --</option>
                          ${this.squareFootagePricing.map(
                            (size) => html`
                              <option
                                value=${size.range}
                                ?selected=${this.selectedSquareFootage
                                  ?.range === size.range}
                              >
                                ${size.range} — $${size.price} —
                                ${this.formatMinutesToHours(size.time)}
                              </option>
                            `
                          )}
                        </select>
                      </div>
                    `
                  : ""}

                <!-- Radiobuttons para tipos de baño -->
                <div class="bathroom-radios" style="margin: 1.5rem 0;">
                  <h4 style="margin-bottom:0.5rem; text-align: center;">
                    Select bathroom type
                  </h4>
                  <div
                    style="display: flex; flex-wrap: wrap; justify-content: center;"
                  >
                    ${this.bathroomOptions.map(
                      (option) => html`
                        <label
                          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            font-size: 0.95rem;
            width: 150px;
            margin: 0.5rem;
            text-align: center;
          "
                        >
                          <input
                            type="radio"
                            name="bathroomType"
                            value="${option.value}"
                            .checked=${this.selectedBathroom === option.value}
                            @change=${this.handleBathroomRadio.bind(this)}
                            style="accent-color: var(--primary-color); margin-bottom: 0.3rem;"
                          />
                          <span style="line-height: 1.2;">${option.label}</span>
                        </label>
                      `
                    )}
                  </div>
                </div>

                ${this.selectedService.additionalServices?.length > 0 ||
                this.globalAdditionalServices.length > 0
                  ? html`
                      <div class="extras-section">
                        <h3>Select Add-ons</h3>
                        <div class="size-options">
                          ${[
                            ...(this.selectedService.additionalServices || []),
                            ...this.globalAdditionalServices,
                          ].map(
                            (extra) => html`
                              <div
                                class="size-option ${this.selectedExtras.some(
                                  (e) => e.name === extra.name
                                )
                                  ? "selected"
                                  : ""}"
                                @click=${() => this.toggleExtra(extra)}
                              >
                                ${extra.image
                                  ? html`<img
                                      src=${extra.image}
                                      alt=${extra.name}
                                      class="img-extras"
                                    />`
                                  : ""}

                                <div class="size-range">${extra.name}</div>
                                <div class="size-price">+$${extra.price}</div>
                                <div class="size-time">
                                  ${this.formatMinutesToHours(extra.time)}
                                </div>
                              </div>
                            `
                          )}
                        </div>
                      </div>
                    `
                  : ""}

                <div class="summary-card">
                  <div class="summary-title">Order Summary</div>
                  <div class="summary-item">
                    <span>Base Service:</span>
                    <span>$${this.selectedService.price}</span>
                  </div>
                  ${this.bookingData.additionalData
                    ? html`
                        <div class="summary-item">
                          <span>Bathroom type:</span>
                          <span>${this.bookingData.additionalData}</span>
                        </div>
                      `
                    : ""}
                  ${this.selectedSquareFootage
                    ? html`
                        <div class="summary-item">
                          <span
                            >Size (${this.selectedSquareFootage.range}):</span
                          >
                          <span>+$${this.selectedSquareFootage.price}</span>
                        </div>
                      `
                    : ""}
                  ${this.selectedExtras.map(
                    (extra) => html`
                      <div class="summary-item">
                        <span>${extra.name}:</span>
                        <span>+$${extra.price}</span>
                      </div>
                    `
                  )}
                  <div class="summary-item summary-total">
                    <span>Total:</span>
                    <span>$${this.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  @click=${this.confirmServiceSelection}
                  class="confirm-button"
                >
                  Confirm Selection & Continue
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }

  renderStep2() {
    // Generar opciones de hora cada 15 minutos dentro del horario comercial
    const timeOptions = [];
    for (
      let hour = this.businessHours.start;
      hour <= this.businessHours.end;
      hour++
    ) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Formatear a HH:MM
        const timeString = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        timeOptions.push(timeString);
      }
    }

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar la hora
    const minDate = today.toISOString().split("T")[0];

    return html`
      <div class="step-content" id="step-2">
        <div class="form-container">
          <h3>Schedule Your Service</h3>
          ${this.formError
            ? html`<div class="error-message" style="margin-bottom: 1rem;">
                ${this.formError}
              </div>`
            : ""}

          <div class="form-group">
            <label for="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              .value=${this.bookingData.schedule.date}
              @change=${this.handleScheduleChange}
              min=${minDate}
            />
          </div>
          <div class="form-group">
            <label for="time">Time</label>
            <select
              id="time"
              name="time"
              .value=${this.bookingData.schedule?.time || ""}
              @change=${this.handleScheduleChange}
            >
              <option value="">Select a time</option>
              ${timeOptions.map(
                (time) => html` <option value=${time}>${time}</option> `
              )}
            </select>
          </div>
          <div class="form-group">
            <label for="frequency">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              .value=${this.bookingData.schedule.frequency}
              @change=${this.handleScheduleChange}
            >
              <option value="one-time">One Time</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="form-group">
            <label for="notes"
              >Additional information to help us provide an exceptional
              service</label
            >
            <textarea
              id="notes"
              name="notes"
              rows="3"
              placeholder="Add any details, instructions, or special requests to help us serve you better..."
              .value=${this.bookingData.schedule.notes || ""}
              @input=${this.handleScheduleChange}
              style="resize:vertical;width:100%;border-radius:10px;padding:0.7rem 1rem;border:1.5px solid var(--medium-gray);font-size:1rem;background:#f9fafb;"
            ></textarea>
          </div>
          <div class="navigation-buttons">
            <button class="secondary" @click=${this.prevStep}>Back</button>
            <button @click=${this.nextStep}>Continue</button>
          </div>
        </div>
      </div>
    `;
  }

  renderStep3() {
    return html`
      <div class="step-content">
        <div class="form-container">
          <h3>Your Information</h3>
          ${this.formError
            ? html`<div class="error-message" style="margin-bottom: 1rem;">
                ${this.formError}
              </div>`
            : ""}

          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              .value=${this.bookingData.generalInfo.name}
              @change=${this.handleGeneralInfoChange}
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              .value=${this.bookingData.generalInfo.email}
              @change=${this.handleGeneralInfoChange}
            />
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              .value=${this.bookingData.generalInfo.phone}
              @change=${this.handleGeneralInfoChange}
            />
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              .value=${this.bookingData.generalInfo.address}
              @change=${this.handleGeneralInfoChange}
            />
          </div>
          <div class="form-group">
            <label for="postalCode">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              .value=${this.bookingData.generalInfo.postalCode}
              @change=${this.handleGeneralInfoChange}
            />
          </div>
          <div class="form-group">
            <label for="state">State</label>
            <input
              type="text"
              id="state"
              name="state"
              .value=${this.bookingData.generalInfo.state}
              @change=${this.handleGeneralInfoChange}
            />
          </div>
          <div class="navigation-buttons">
            <button class="secondary" @click=${this.prevStep}>Back</button>
            <button @click=${this.nextStep}>Continue</button>
          </div>
        </div>
      </div>
    `;
  }

  renderStep4() {
    // Montar Stripe element cada vez que se renderiza el paso 4
    setTimeout(() => {
      if (this.currentStep === 4) {
        this.setupStripeElement();
      }
    }, 100);

    // Determinar si el mensaje es de éxito (si contiene 'Coupon applied!')
    const isCouponSuccess = this.couponStatus && typeof this.couponStatus.message === 'string' && this.couponStatus.message.startsWith('Coupon applied!');
    return html`
      <div class="step-content" id="step-4">
        <div class="form-container">
          <h3>Payment Information</h3>
          <!-- Sección de cupón -->
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label for="coupon">Coupon Code</label>
            <div style="display:flex;gap:0.5rem;align-items:center;">
              <input
                type="text"
                id="coupon"
                name="coupon"
                .value=${this.couponCode}
                @input=${this.handleCouponInput.bind(this)}
                style="flex:1;"
                placeholder="Enter coupon code"
                autocomplete="off"
              />
              <button type="button" @click=${this.validateCoupon.bind(this)} style="min-width:100px;">
                Validate
              </button>
            </div>
            ${this.couponStatus && this.couponStatus.message !== undefined
              ? html`<div class="${isCouponSuccess ? 'success-message' : 'error-message'}" style="margin-top:0.5rem;">
                  ${this.couponStatus.message}
                </div>`
              : ''}
          </div>

          <div class="payment-section">
            <div class="payment-section-header">
              <div class="payment-icon">💳</div>
              <h4 class="payment-title">Credit/Debit Card</h4>
            </div>

            <div class="payment-methods">
              <div class="payment-method selected">
                <div class="payment-method-icon">🟦</div>
                <div class="payment-method-info">
                  <div class="payment-method-title">Card Payment</div>
                  <div class="payment-method-description">
                    Pay securely with your credit or debit card
                  </div>
                </div>
              </div>
            </div>

            <div id="card-element-container">
              <div id="card-element"></div>
              <p class="card-hint">
                We use Stripe for secure payments. Your card details are
                encrypted.
              </p>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-title">Order Summary</div>
            <div class="summary-item">
              <span>Service:</span>
              <span>${this.bookingData.serviceInfo?.service?.name}</span>
            </div>
            ${this.bookingData.additionalData
              ? html`
                  <div class="summary-item">
                    <span>Bathroom type:</span>
                    <span>${this.bookingData.additionalData}</span>
                  </div>
                `
              : ""}
            ${this.bookingData.serviceInfo?.squareFootage
              ? html`
                  <div class="summary-item">
                    <span>Size (${this.bookingData.serviceInfo.squareFootage.range}):</span>
                    <span>$${this.bookingData.serviceInfo.squareFootage.price}</span>
                  </div>
                `
              : ""}
            ${this.bookingData.serviceInfo?.extras?.length > 0
              ? this.bookingData.serviceInfo.extras.map(
                  (extra) => html`
                    <div class="summary-item">
                      <span>${extra.name}:</span>
                      <span>+$${extra.price}</span>
                    </div>
                  `
                )
              : ""}
            <div class="summary-item">
              <span>Subtotal:</span>
              <span>$${this.bookingData.serviceInfo?.total?.toFixed(2)}</span>
            </div>
            ${this.discountPercent > 0 && this.discountedTotal !== null
              ? html`
                  <div class="summary-item success-message">
                    <span>Coupon (${this.discountPercent}% off):</span>
                    <span>-$${(this.bookingData.serviceInfo.total - this.discountedTotal).toFixed(2)}</span>
                  </div>
                  <div class="summary-item summary-total">
                    <span>Total Amount:</span>
                    <span>$${this.discountedTotal.toFixed(2)}</span>
                  </div>
                `
              : html`
                  <div class="summary-item summary-total">
                    <span>Total Amount:</span>
                    <span>$${this.bookingData.serviceInfo?.total?.toFixed(2)}</span>
                  </div>
                `}
          </div>

          ${this.paymentError
            ? html`<div class="error-message">${this.paymentError}</div>`
            : ""}

          <div class="navigation-buttons">
            <button class="secondary" @click=${this.prevStep}>Back</button>
            <button
              @click=${this.completeBooking}
              ?disabled=${this.paymentProcessing}
            >
              ${this.paymentProcessing ? "Processing..." : "Complete Booking"}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Añade el lifecycle updated
  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has("currentStep") && this.currentStep === 4) {
      this.setupStripeElement();
    }
  }

  renderStep5() {
    return html`
      <div class="step-content">
        <div class="confirmation-container">
          <div class="confirmation-icon">✓</div>
          <h3 class="confirmation-title">Booking Confirmed!</h3>
          <p class="confirmation-message">
            Thank you for your Booking. We've sent a confirmation to
            ${this.bookingData.generalInfo.email}. Your service is scheduled for
            ${this.bookingData.schedule.date} at
            ${this.bookingData.schedule.time}.
          </p>

          <div class="confirmation-details">
            <div class="summary-item">
              <span>Service:</span>
              <span>${this.bookingData.serviceInfo?.service?.name}</span>
            </div>

            ${this.bookingData.serviceInfo?.squareFootage
              ? html`
                  <div class="summary-item">
                    <span
                      >Size
                      (${this.bookingData.serviceInfo.squareFootage
                        .range}):</span
                    >
                    <span
                      >$${this.bookingData.serviceInfo.squareFootage
                        .price}</span
                    >
                  </div>
                `
              : ""}
            ${this.bookingData.serviceInfo?.extras?.length > 0
              ? html`
                  ${this.bookingData.serviceInfo.extras.map(
                    (extra) => html`
                      <div class="summary-item">
                        <span>${extra.name}:</span>
                        <span>+$${extra.price}</span>
                      </div>
                    `
                  )}
                `
              : ""}

            <div class="summary-total">
              <span>Total Charged:</span>
              <span>$${this.bookingData.serviceInfo?.total?.toFixed(2)}</span>
            </div>

            ${this.bookingData.confirmation
              ? html`
                  <div class="summary-item">
                    <span>Booking ID:</span>
                    <span>${this.bookingData.confirmation.bookingId}</span>
                  </div>
                  <div class="summary-item">
                    <span>Transaction ID:</span>
                    <span>${this.bookingData.confirmation.paymentId}</span>
                  </div>
                `
              : ""}
          </div>

          <button @click=${this.resetBooking} class="confirm-button">
            Book Another Service
          </button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("booking-widget")) {
  customElements.define("booking-widget", PremiumBookingWidget);
}

export default PremiumBookingWidget;
