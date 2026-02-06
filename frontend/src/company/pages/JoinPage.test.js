import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import JoinPage from './JoinPage';
import * as api from '../services/api';

// Mock the API module only
jest.mock('../services/api');

const renderJoinPage = (initialPath = '/join') => {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/join" element={<JoinPage />} />
                <Route path="/" element={<div>Home Page</div>} />
            </Routes>
        </MemoryRouter>
    );
};

describe('JoinPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('No Token', () => {
        it('should show error when no token is provided', async () => {
            renderJoinPage('/join');

            await waitFor(() => {
                expect(screen.getByText(/Invalid invite link/i)).toBeInTheDocument();
            });
        });
    });

    describe('Success State', () => {
        it('should show success message on successful join', async () => {
            api.joinOrg.mockResolvedValue({
                message: 'Joined organization',
                org: { name: 'Awesome Company' }
            });

            renderJoinPage('/join?token=valid-token');

            await waitFor(() => {
                expect(screen.getByText(/Welcome to Awesome Company/i)).toBeInTheDocument();
            });
        });

        it('should show button to go to app', async () => {
            api.joinOrg.mockResolvedValue({
                org: { name: 'Test Org' }
            });

            renderJoinPage('/join?token=valid-token');

            await waitFor(() => {
                expect(screen.getByText('Go to Formalize')).toBeInTheDocument();
            });
        });

        it('should navigate home when button is clicked', async () => {
            api.joinOrg.mockResolvedValue({
                org: { name: 'Test Org' }
            });

            renderJoinPage('/join?token=valid-token');

            await waitFor(() => {
                expect(screen.getByText('Go to Formalize')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Go to Formalize'));

            // After navigation, should see the home page
            await waitFor(() => {
                expect(screen.getByText('Home Page')).toBeInTheDocument();
            });
        });
    });

    describe('Error States', () => {
        it('should show expired message for expired token', async () => {
            api.joinOrg.mockRejectedValue(new Error('Token expired'));

            renderJoinPage('/join?token=expired-token');

            await waitFor(() => {
                expect(screen.getByText(/expired/i)).toBeInTheDocument();
            });
        });

        it('should show login message when not authenticated', async () => {
            api.joinOrg.mockRejectedValue(new Error('Please be logged in'));

            renderJoinPage('/join?token=some-token');

            await waitFor(() => {
                expect(screen.getByText(/sign in/i)).toBeInTheDocument();
            });
        });

        it('should show generic error for other failures', async () => {
            api.joinOrg.mockRejectedValue(new Error('Something went wrong'));

            renderJoinPage('/join?token=some-token');

            await waitFor(() => {
                expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
            });
        });

        it('should show Go to Homepage button on error', async () => {
            api.joinOrg.mockRejectedValue(new Error('Error'));

            renderJoinPage('/join?token=some-token');

            await waitFor(() => {
                expect(screen.getByText('Go to Homepage')).toBeInTheDocument();
            });
        });
    });

    describe('Branding', () => {
        it('should show Formalize logo', () => {
            api.joinOrg.mockImplementation(() => new Promise(() => { }));

            renderJoinPage('/join?token=test');
            expect(screen.getByText('Formalize')).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading state with valid token', () => {
            api.joinOrg.mockImplementation(() => new Promise(() => { }));

            renderJoinPage('/join?token=valid-token');
            expect(screen.getByText('Processing your invitation...')).toBeInTheDocument();
        });
    });
});
