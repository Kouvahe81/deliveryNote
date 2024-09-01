import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Invoice from '../src/components/Invoice';

describe('Invoice Component', () => {
  test('should render the Invoice component and handle form submission', () => {
    render(<Invoice />);
    
    // Vérifier que le titre est bien rendu
    expect(screen.getByText(/Invoice/i)).toBeInTheDocument();

    // Simuler une entrée dans le champ nom
    fireEvent.change(screen.getByPlaceholderText('Nom'), { target: { value: 'Jean Dupont' } });
    
    // Simuler une entrée dans le champ adresse
    fireEvent.change(screen.getByPlaceholderText('Adresse'), { target: { value: '123 Rue de Paris' } });
    
    // Simuler le clic sur le bouton de soumission
    fireEvent.click(screen.getByText(/Envoyer/i));

    // Vérifier que la fonction de soumission a bien été appelée
    expect(screen.getByText(/Facture envoyée avec succès/i)).toBeInTheDocument();
  });
});
