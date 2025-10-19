/**
 * Composant Alpine.js pour la page des paramètres
 */
export function createSettingsPage() {
  return {
    apiUrl: 'http://localhost:3000/api',
    isApiUrlValid: true,
    apiTestResult: null as 'success' | 'error' | null,

    init() {
      console.log('SettingsPage initialized');
      // Charger l'URL de l'API depuis le localStorage si disponible
      const savedApiUrl = localStorage.getItem('apiUrl');
      if (savedApiUrl) {
        this.apiUrl = savedApiUrl;
      }
    },

    get settingsPageContent() {
      return this.buildSettingsPage();
    },

    buildSettingsPage() {
      return `
        <div class="settings-container">
          <h2 class="settings-title">Paramètres</h2>
          
          <div class="settings-sections">
            
            <!-- Configuration de l'API -->
            <div class="settings-section">
              <h3 class="section-title">Configuration de l'API</h3>
              <div class="section-content">
                <div>
                  <label class="label">URL de l'API Backend</label>
                  <input 
                    type="text" 
                    x-model="apiUrl"
                    @input="isApiUrlValid = true; apiTestResult = null"
                    class="input"
                    placeholder="http://localhost:3000/api"
                  >
                  <p class="input-hint">L'URL de votre serveur backend</p>
                  
                  <!-- Résultat du test -->
                  <div x-show="apiTestResult === 'success'" class="api-test-success">
                    ✅ Connexion réussie !
                  </div>
                  <div x-show="apiTestResult === 'error'" class="api-test-error">
                    ❌ Impossible de se connecter à l'API
                  </div>
                </div>
                
                <div class="settings-actions">
                  <button @click="testApiConnection()" type="button" class="btn btn-secondary">
                    🔍 Tester la connexion
                  </button>
                  <button @click="saveApiUrl()" type="button" class="btn btn-primary">
                    💾 Enregistrer
                  </button>
                </div>
              </div>
            </div>

            <!-- À propos -->
            <div class="settings-section">
              <h3 class="section-title">À propos</h3>
              <div class="section-content">
                <div class="about-grid">
                  <div class="about-item">
                    <span class="about-label">Version</span>
                    <span class="about-value">1.0.0</span>
                  </div>
                  <div class="about-item">
                    <span class="about-label">Application</span>
                    <span class="about-value">Kamas Manager</span>
                  </div>
                  <div class="about-item">
                    <span class="about-label">Description</span>
                    <span class="about-value">Gestion de craft et forgemagie pour Dofus</span>
                  </div>
                  <div class="about-item">
                    <span class="about-label">Technologie</span>
                    <span class="about-value">Alpine.js + Tailwind CSS</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    },

    async testApiConnection() {
      try {
        const response = await fetch(`${this.apiUrl.replace(/\/$/, '')}/items`);
        if (response.ok) {
          this.apiTestResult = 'success';
        } else {
          this.apiTestResult = 'error';
        }
      } catch (error) {
        this.apiTestResult = 'error';
      }
    },

    saveApiUrl() {
      if (this.apiUrl.trim() === '') {
        this.isApiUrlValid = false;
        return;
      }
      
      localStorage.setItem('apiUrl', this.apiUrl);
      this.isApiUrlValid = true;
      
      // Afficher une notification (tu peux améliorer ça plus tard)
      alert('✅ URL de l\'API enregistrée avec succès !');
    }
  };
}