// Test End to end
// cypress/integration/invoice.spec.js
describe('Invoice End-to-End Test', () => {
    beforeEach(() => {
      // Accéder à la page contenant le composant Invoice
      cy.visit('/'); // Assurez-vous que ce chemin est correct
    });
  
    it('should fill out the invoice form and submit it', () => {
      // Vérifier que le titre est présent
      cy.contains('Invoice').should('be.visible');
  
      // Remplir le formulaire
      cy.get('input[placeholder="Nom"]').type('Jean Dupont');
      cy.get('input[placeholder="Adresse"]').type('123 Rue de Paris');
  
      // Soumettre le formulaire
      cy.contains('Envoyer').click();
  
      // Vérifier le message de succès
      cy.contains('Facture envoyée avec succès').should('be.visible');
    });
  });
  