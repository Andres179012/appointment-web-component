import { LitElement, html, css } from "lit";

class AppointmentWidget extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif;
      line-height: 1.5;
      color: #1a202c;
      width: 100%;
      --primary-color: #6366f1;
      --primary-hover: #4f46e5;
      --secondary-color: #e0e7ff;
      --success-color: #10b981;
      --error-color: #ef4444;
      --text-color: #1a202c;
      --light-gray: #f8fafc;
      --medium-gray: #e2e8f0;
      --dark-gray: #64748b;
      --border-radius: 12px;
      --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .container {
      padding: 2rem;
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transition: var(--transition);
      border: 1px solid var(--medium-gray);
      width: 100%;
      max-width: 100%;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0 0 2rem 0;
      text-align: center;
      position: relative;
      padding-bottom: 1rem;
    }

    .title::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: var(--primary-color);
      border-radius: 2px;
    }

    .form-group {
      margin-bottom: 1.5rem;
      animation: fadeIn 0.4s ease-out;
    }

    .form-label {
      display: block;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .form-label.required::after {
      content: " *";
      color: var(--error-color);
    }

    .form-input,
    .form-textarea,
    .form-select,
    .form-date,
    .form-time {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--medium-gray);
      border-radius: var(--border-radius);
      font-size: 1rem;
      transition: var(--transition);
      background-color: white;
    }

    .form-textarea {
      min-height: 120px;
      resize: vertical;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus,
    .form-date:focus,
    .form-time:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      background-color: white;
    }

    /* Enhanced Date Picker Styling */
    .form-date {
      padding-right: 2.5rem;
      cursor: pointer;
    }

    .form-date:focus {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='var(--primary-color)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
    }

    /* Enhanced Time Picker Styling */
    .form-time {
      padding-right: 2.5rem;
      cursor: pointer;
    }

    .form-time:focus {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='var(--primary-color)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E");
    }

    .button {
      width: 100%;
      padding: 1rem;
      background-color: var(--primary-color);
      color: white;
      font-weight: 600;
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
    }

    .button:hover {
      background-color: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(99, 102, 241, 0.15);
    }

    .button:active {
      transform: translateY(0);
    }

    .button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none !important;
    }

    .button.secondary {
      background-color: white;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
      box-shadow: none;
    }

    .button.secondary:hover {
      background-color: var(--secondary-color);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
      display: inline-block;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    .alert {
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: 1.5rem;
      font-size: 0.9375rem;
      animation: fadeIn 0.3s ease;
      display: flex;
      align-items: center;
    }

    .alert-error {
      background-color: #fef2f2;
      color: var(--error-color);
      border-left: 4px solid var(--error-color);
    }

    .alert-success {
      background-color: #f0fdf4;
      color: var(--success-color);
      border-left: 4px solid var(--success-color);
    }

    .alert-icon {
      margin-right: 0.75rem;
      font-size: 1.25rem;
    }

    .date-time-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .address-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .progress-container {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-bottom: 2.5rem;
      counter-reset: step;
    }

    .progress-bar {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 6px;
      background-color: var(--medium-gray);
      border-radius: 3px;
      transform: translateY(-50%);
      z-index: 1;
    }

    .progress {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: var(--primary-color);
      border-radius: 3px;
      transition: width 0.4s ease;
      z-index: 2;
    }

    .step {
      position: relative;
      z-index: 3;
      text-align: center;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: white;
      border: 3px solid var(--medium-gray);
      color: var(--dark-gray);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.5rem;
      transition: var(--transition);
    }

    .step.active .step-circle {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background-color: var(--secondary-color);
    }

    .step.completed .step-circle {
      border-color: var(--primary-color);
      background-color: var(--primary-color);
      color: white;
    }

    .step-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--dark-gray);
      transition: var(--transition);
      white-space: nowrap;
    }

    .step.active .step-label,
    .step.completed .step-label {
      color: var(--primary-color);
    }

    .step-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .step-buttons .button {
      flex: 1;
    }

    .confirmation {
      text-align: center;
      padding: 2rem;
      animation: fadeIn 0.5s ease;
    }

    .confirmation-icon {
      width: 80px;
      height: 80px;
      background-color: var(--success-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
      animation: pulse 1.5s infinite;
    }

    .confirmation-message {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .confirmation-details {
      color: var(--dark-gray);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .confirmation-highlight {
      color: var(--primary-color);
      font-weight: 600;
    }

    /* Phone input container */
    .phone-input-container {
      position: relative;
    }

    .phone-prefix {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--dark-gray);
      pointer-events: none;
    }

    .phone-input {
      padding-left: 2.5rem !important;
    }

    /* Service select styling */
    .form-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364758b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 20px;
      padding-right: 2.5rem;
      cursor: pointer;
    }

    .form-select:focus {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='var(--primary-color)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    }

    /* Loading state for services */
    .loading-services {
      color: var(--dark-gray);
      font-size: 0.875rem;
      text-align: center;
      padding: 1rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1.5rem;
      }

      .date-time-container,
      .address-container {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .progress-container {
        margin-bottom: 2rem;
      }
    }

    @media (max-width: 480px) {
      .step-label {
        font-size: 0.75rem;
      }

      .step-buttons {
        flex-direction: column;
      }
    }
  `;

  static properties = {
    currentStep: { type: Number },
    formData: { type: Object },
    loading: { type: Boolean },
    errorMessage: { type: String },
    successMessage: { type: String },
    submitted: { type: Boolean },
    widgetId: { type: String },
    services: { type: Array },
    loadingServices: { type: Boolean },
    config: { type: Object },
  };

  constructor() {
    super();
    this.currentStep = 1;
    this.formData = {
      appId: "",
      userId: "",
      nombreUsuario: "",
      servicio: "",
      email: "",
      phone: "+1",
      address: {
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        additionalInfo: "",
      },
      date: "",
      time: "",
      notes: "",
      status: "pending",
    };
    this.loading = false;
    this.errorMessage = "";
    this.successMessage = "";
    this.submitted = false;
    this.widgetId = "";
    this.services = [];
    this.loadingServices = true;
    this.config = {};
    this.apiSecret = "d9e180f3-d77d-4c25-a163-4605c8ddfb48";
    this.apiEndpoint =
      "http://localhost:3000/api/appointments/new-appointment";
  }

  connectedCallback() {
    super.connectedCallback();
    this.formData.appId = this.widgetId;
    this.fetchServices();
  }

  async fetchServices() {
    try {
      this.loadingServices = true;
      const response = await fetch(
        `http://localhost:3000/api/appointments/config/${this.widgetId}`,
        {
          headers: {
            "x-api-secret": this.apiSecret,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }

      const data = await response.json();
      console.log("API Response Data:", data);

      if (data) {
        this.config = data;

        if (data.color) {
          this.style.setProperty("--primary-color", data.color);
          const hoverColor = this.darkenColor(data.color, 20);
          this.style.setProperty("--primary-hover", hoverColor);
          const secondaryColor = this.lightenColor(data.color, 90);
          this.style.setProperty("--secondary-color", secondaryColor);
        }

        if (data.services) {
          this.services = Object.values(data.services).map(
            (service) => service.name
          );
          console.log("Services extracted:", this.services);
        } else {
          this.services = [];
          console.warn("No services found in response");
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      this.errorMessage = "Failed to load services. Please try again later.";
      this.services = [];
    } finally {
      this.loadingServices = false;
    }
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", "")),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = ((num >> 8) & 0x00ff) - amt,
      B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", "")),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R > 255 ? 255 : R) * 0x10000 +
        (G > 255 ? 255 : G) * 0x100 +
        (B > 255 ? 255 : B)
      )
        .toString(16)
        .slice(1)
    );
  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.value;
    const name = target.name;
  
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      this.formData = {
        ...this.formData,
        address: {
          ...this.formData.address,
          [field]: value,
        },
      };
      return;
    }
  
    if (name === "phone") {
      const cleanedValue = value.replace(/\D/g, '');
      let formattedValue = "+1" + cleanedValue.substring(0, 10);
      
      this.formData = {
        ...this.formData,
        phone: formattedValue,
      };
  
      requestAnimationFrame(() => {
        if (target) {
          target.value = formattedValue.substring(2);
        }
      });
    } else {
      this.formData = {
        ...this.formData,
        [name]: value,
      };
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  prevStep() {
    this.currentStep--;
  }

  validateCurrentStep() {
    if (this.currentStep === 1) {
      if (
        !this.formData.nombreUsuario ||
        !this.formData.email ||
        !this.formData.phone
      ) {
        this.errorMessage = "Please fill in all required fields";
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.errorMessage = "Please enter a valid email address";
        return false;
      }

      const phoneRegex = /^\+1\d{10}$/;
      if (!phoneRegex.test(this.formData.phone)) {
        this.errorMessage =
          "Please enter a valid US phone number (10 digits after +1)";
        return false;
      }
    } else if (this.currentStep === 2) {
      if (
        !this.formData.address.street ||
        !this.formData.address.city ||
        !this.formData.address.state ||
        !this.formData.address.postalCode
      ) {
        this.errorMessage = "Please fill in all required address fields";
        return false;
      }
    } else if (this.currentStep === 3) {
      if (
        !this.formData.servicio ||
        !this.formData.date ||
        !this.formData.time
      ) {
        this.errorMessage = "Please fill in all required fields";
        return false;
      }

      const selectedDate = new Date(this.formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        this.errorMessage = "Please select a date in the future";
        return false;
      }

      // Validar que el tiempo esté en intervalos de 15 minutos
      const timeParts = this.formData.time.split(':');
      if (timeParts.length === 2) {
        const minutes = parseInt(timeParts[1]);
        if (minutes % 15 !== 0) {
          this.errorMessage = "Please select a time in 15-minute intervals (00, 15, 30, 45)";
          return false;
        }
      }
    }
    this.errorMessage = "";
    return true;
  }

  async submitAppointment() {
    this.loading = true;
    this.errorMessage = "";

    try {
      if (!this.formData.userId) {
        this.formData.userId = `user_${Date.now()}`;
      }

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": this.apiSecret,
        },
        body: JSON.stringify(this.formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error creating appointment");
      }

      this.submitted = true;
      this.successMessage = "Appointment successfully scheduled!";
    } catch (error) {
      this.errorMessage = error.message || "Failed to submit appointment";
    } finally {
      this.loading = false;
    }
  }

  renderStep1() {
    return html`
      <div class="form-group">
        <label class="form-label required">Full Name</label>
        <input
          type="text"
          name="nombreUsuario"
          .value=${this.formData.nombreUsuario}
          @input=${this.handleInputChange}
          required
          class="form-input"
          ?disabled=${this.loading}
          placeholder="John Doe"
        />
      </div>

      <div class="form-group">
        <label class="form-label required">Email</label>
        <input
          type="email"
          name="email"
          .value=${this.formData.email}
          @input=${this.handleInputChange}
          required
          class="form-input"
          ?disabled=${this.loading}
          placeholder="john@example.com"
        />
      </div>

      <div class="form-group">
        <label class="form-label required">Phone</label>
        <div class="phone-input-container">
          <span class="phone-prefix">+1</span>
          <input
            type="tel"
            name="phone"
            .value=${this.formData.phone.substring(2)}
            @input=${this.handleInputChange}
            required
            class="form-input phone-input"
            ?disabled=${this.loading}
            placeholder="5551234567"
            maxlength="10"
            pattern="[0-9]*"
            inputmode="numeric"
          />
        </div>
      </div>
    `;
  }

  renderStep2() {
    return html`
      <h3 class="form-subtitle">Address Information</h3>

      <div class="form-group">
        <label class="form-label required">Street Address</label>
        <input
          type="text"
          name="address.street"
          .value=${this.formData.address.street}
          @input=${this.handleInputChange}
          required
          class="form-input"
          ?disabled=${this.loading}
          placeholder="123 Main St"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Apartment/Suite (Optional)</label>
        <input
          type="text"
          name="address.apartment"
          .value=${this.formData.address.apartment}
          @input=${this.handleInputChange}
          class="form-input"
          ?disabled=${this.loading}
          placeholder="Apt 4B"
        />
      </div>

      <div class="address-container">
        <div class="form-group">
          <label class="form-label required">City</label>
          <input
            type="text"
            name="address.city"
            .value=${this.formData.address.city}
            @input=${this.handleInputChange}
            required
            class="form-input"
            ?disabled=${this.loading}
            placeholder="New York"
          />
        </div>

        <div class="form-group">
          <label class="form-label required">State</label>
          <input
            type="text"
            name="address.state"
            .value=${this.formData.address.state}
            @input=${this.handleInputChange}
            required
            class="form-input"
            ?disabled=${this.loading}
            placeholder="NY"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label required">Postal Code</label>
        <input
          type="text"
          name="address.postalCode"
          .value=${this.formData.address.postalCode}
          @input=${this.handleInputChange}
          required
          class="form-input"
          ?disabled=${this.loading}
          placeholder="10001"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Additional Instructions</label>
        <textarea
          name="address.additionalInfo"
          .value=${this.formData.address.additionalInfo}
          @input=${this.handleInputChange}
          class="form-textarea"
          ?disabled=${this.loading}
          placeholder="Gate code, landmarks, etc."
        ></textarea>
      </div>
    `;
  }

  generateTimeOptions() {
    const options = [];
    const startHour = 8; // 8 AM
    const endHour = 18;  // 6 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      [0, 15, 30, 45].forEach(minute => {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        options.push(html`<option value="${hourStr}:${minuteStr}"></option>`);
      });
    }
    
    return options;
  }

  renderStep3() {
    return html`
      <div class="form-group">
        <label class="form-label required">Service</label>
        ${this.loadingServices
          ? html`
              <div class="loading-services">Loading available services...</div>
            `
          : html`
              <select
                name="servicio"
                .value=${this.formData.servicio}
                @input=${this.handleInputChange}
                required
                class="form-select"
                ?disabled=${this.loading || this.loadingServices}
              >
                <option value="" disabled selected>Select a service</option>
                ${this.services.map(
                  (service) => html`
                    <option value=${service}>${service}</option>
                  `
                )}
              </select>
            `}
      </div>

      <div class="date-time-container">
        <div class="form-group">
          <label class="form-label required">Date</label>
          <input
            type="date"
            name="date"
            .value=${this.formData.date}
            @input=${this.handleInputChange}
            required
            class="form-date"
            ?disabled=${this.loading}
            min=${new Date().toISOString().split("T")[0]}
          />
        </div>

        <div class="form-group">
          <label class="form-label required">Time</label>
          <input
            type="time"
            name="time"
            .value=${this.formData.time}
            @input=${this.handleInputChange}
            required
            class="form-time"
            ?disabled=${this.loading}
            min="08:00"
            max="18:00"
            step="900"
            list="timeOptions"
          />
          <datalist id="timeOptions">
            ${this.generateTimeOptions()}
          </datalist>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Additional Notes</label>
        <textarea
          name="notes"
          .value=${this.formData.notes}
          @input=${this.handleInputChange}
          class="form-textarea"
          ?disabled=${this.loading}
          placeholder="Any special requirements or notes..."
        ></textarea>
      </div>
    `;
  }

  renderStep4() {
    return html`
      <div class="confirmation">
        <div class="confirmation-icon">✓</div>
        <div class="confirmation-message">
          Your appointment has been scheduled successfully!
        </div>
        <div class="confirmation-details">
          <p>
            We've scheduled your appointment for
            <span class="confirmation-highlight"
              >${this.formatDate(this.formData.date)}</span
            >
            at
            <span class="confirmation-highlight"
              >${this.formatTime(this.formData.time)}</span
            >.
          </p>
          <p>
            Service:
            <span class="confirmation-highlight"
              >${this.formData.servicio}</span
            >
          </p>
          <p>
            Address:
            <span class="confirmation-highlight">
              ${this.formData.address.street}${this.formData.address.apartment
                ? `, ${this.formData.address.apartment}`
                : ""},
              ${this.formData.address.city}, ${this.formData.address.state}
              ${this.formData.address.postalCode}
            </span>
          </p>
          <p>
            We'll call you at
            <span class="confirmation-highlight"
              >${this.formatPhoneNumber(this.formData.phone)}</span
            >
            to confirm the details.
          </p>
        </div>
        <button
          class="button"
          @click=${() => {
            this.currentStep = 1;
            this.submitted = false;
            this.formData = {
              appId: this.widgetId,
              userId: "",
              nombreUsuario: "",
              servicio: "",
              email: "",
              phone: "+1",
              address: {
                street: "",
                apartment: "",
                city: "",
                state: "",
                postalCode: "",
                country: "US",
                additionalInfo: "",
              },
              date: "",
              time: "",
              notes: "",
              status: "pending",
            };
          }}
          ?disabled=${this.loading}
        >
          Schedule Another Appointment
        </button>
      </div>
    `;
  }

  formatDate(dateString) {
    if (!dateString) return "";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  formatTime(timeString) {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  formatPhoneNumber(phone) {
    if (!phone) return "";
    const cleaned = phone.substring(2);
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }

  renderProgressSteps() {
    return html`
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress"
            style="width: ${(this.currentStep / 3) * 100}%"
          ></div>
        </div>

        ${[1, 2, 3].map(
          (step) => html`
            <div
              class="step ${this.currentStep > step ? "completed" : ""} ${this
                .currentStep === step
                ? "active"
                : ""}"
            >
              <div class="step-circle">
                ${this.currentStep > step ? "✓" : step}
              </div>
              <div class="step-label">
                ${step === 1
                  ? "Your Info"
                  : step === 2
                  ? "Address"
                  : "Appointment"}
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        <h2 class="title">Schedule an Appointment</h2>

        ${this.errorMessage
          ? html`
              <div class="alert alert-error">
                <span class="alert-icon">!</span>
                ${this.errorMessage}
              </div>
            `
          : ""}
        ${this.successMessage
          ? html`
              <div class="alert alert-success">
                <span class="alert-icon">✓</span>
                ${this.successMessage}
              </div>
            `
          : ""}
        ${!this.submitted
          ? html`
              ${this.renderProgressSteps()}
              ${this.currentStep === 1 ? this.renderStep1() : ""}
              ${this.currentStep === 2 ? this.renderStep2() : ""}
              ${this.currentStep === 3 ? this.renderStep3() : ""}

              <div class="step-buttons">
                ${this.currentStep > 1
                  ? html`
                      <button
                        type="button"
                        class="button secondary"
                        @click=${this.prevStep}
                        ?disabled=${this.loading}
                      >
                        Back
                      </button>
                    `
                  : html`<div></div>`}
                ${this.currentStep < 3
                  ? html`
                      <button
                        type="button"
                        class="button"
                        @click=${this.nextStep}
                        ?disabled=${this.loading}
                      >
                        Next
                      </button>
                    `
                  : html`
                      <button
                        type="button"
                        class="button"
                        @click=${this.submitAppointment}
                        ?disabled=${this.loading ||
                        this.loadingServices ||
                        !this.formData.servicio}
                      >
                        ${this.loading
                          ? html`<span class="spinner"></span>`
                          : ""}
                        ${this.loading
                          ? "Scheduling..."
                          : "Confirm Appointment"}
                      </button>
                    `}
              </div>
            `
          : this.renderStep4()}
      </div>
    `;
  }
}

customElements.define("appointment-widget", AppointmentWidget);
export default AppointmentWidget;