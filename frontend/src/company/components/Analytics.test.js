import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Analytics from './Analytics';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

describe('Analytics Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading text initially', () => {
            api.getOrg.mockImplementation(() => new Promise(() => { }));
            api.getOrgSlangs.mockImplementation(() => new Promise(() => { }));
            api.getTemplates.mockImplementation(() => new Promise(() => { }));

            render(<Analytics />);
            expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
        });
    });

    describe('Stats Display', () => {
        beforeEach(() => {
            // API now returns unwrapped data
            api.getOrg.mockResolvedValue({
                name: 'Test Org',
                members: [{ id: '1' }, { id: '2' }, { id: '3' }]
            });
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 'yaar', meaning: 'friend', isApproved: true },
                { id: '2', slang: 'jugaad', meaning: 'innovation', isApproved: true },
                { id: '3', slang: 'pending', meaning: 'test', isApproved: false }
            ]);
            api.getTemplates.mockResolvedValue([
                { id: '1', name: 'Template 1' },
                { id: '2', name: 'Template 2' }
            ]);
        });

        it('should display all stat labels', async () => {
            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('Team Members')).toBeInTheDocument();
                expect(screen.getByText('Total Slangs')).toBeInTheDocument();
                expect(screen.getByText('Approved')).toBeInTheDocument();
                expect(screen.getByText('Pending')).toBeInTheDocument();
                expect(screen.getByText('Templates')).toBeInTheDocument();
            });
        });

        it('should display correct member count next to Team Members label', async () => {
            render(<Analytics />);

            await waitFor(() => {
                // Get the parent element containing "Team Members"
                const teamMembersLabel = screen.getByText('Team Members');
                const statCard = teamMembersLabel.closest('.stat-card');
                expect(statCard).toHaveTextContent('3');
            });
        });

        it('should display correct total slangs count', async () => {
            render(<Analytics />);

            await waitFor(() => {
                const label = screen.getByText('Total Slangs');
                const statCard = label.closest('.stat-card');
                expect(statCard).toHaveTextContent('3');
            });
        });

        it('should display correct approved count', async () => {
            render(<Analytics />);

            await waitFor(() => {
                const label = screen.getByText('Approved');
                const statCard = label.closest('.stat-card');
                expect(statCard).toHaveTextContent('2');
            });
        });

        it('should display correct pending count', async () => {
            render(<Analytics />);

            await waitFor(() => {
                const label = screen.getByText('Pending');
                const statCard = label.closest('.stat-card');
                expect(statCard).toHaveTextContent('1');
            });
        });

        it('should display correct template count', async () => {
            render(<Analytics />);

            await waitFor(() => {
                const label = screen.getByText('Templates');
                const statCard = label.closest('.stat-card');
                expect(statCard).toHaveTextContent('2');
            });
        });
    });

    describe('Top Slangs Display', () => {
        it('should display approved slangs in top list', async () => {
            api.getOrg.mockResolvedValue({ members: [] });
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 'yaar', meaning: 'friend', isApproved: true },
                { id: '2', slang: 'jugaad', meaning: 'innovation', isApproved: true }
            ]);
            api.getTemplates.mockResolvedValue([]);

            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('"yaar"')).toBeInTheDocument();
                expect(screen.getByText('"jugaad"')).toBeInTheDocument();
            });
        });

        it('should only display up to 5 slangs', async () => {
            api.getOrg.mockResolvedValue({ members: [] });
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 's1', meaning: 'm1', isApproved: true },
                { id: '2', slang: 's2', meaning: 'm2', isApproved: true },
                { id: '3', slang: 's3', meaning: 'm3', isApproved: true },
                { id: '4', slang: 's4', meaning: 'm4', isApproved: true },
                { id: '5', slang: 's5', meaning: 'm5', isApproved: true },
                { id: '6', slang: 's6', meaning: 'm6', isApproved: true }
            ]);
            api.getTemplates.mockResolvedValue([]);

            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('"s1"')).toBeInTheDocument();
                expect(screen.getByText('"s5"')).toBeInTheDocument();
                expect(screen.queryByText('"s6"')).not.toBeInTheDocument();
            });
        });
    });

    describe('API Error Handling', () => {
        it('should handle org API failure gracefully', async () => {
            api.getOrg.mockRejectedValue(new Error('Org failed'));
            api.getOrgSlangs.mockResolvedValue([]);
            api.getTemplates.mockResolvedValue([]);

            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('Team Members')).toBeInTheDocument();
            });
        });

        it('should handle slangs API failure gracefully', async () => {
            api.getOrg.mockResolvedValue({ members: [{ id: '1' }] });
            api.getOrgSlangs.mockRejectedValue(new Error('Slangs failed'));
            api.getTemplates.mockResolvedValue([]);

            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('Team Members')).toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty org members array', async () => {
            api.getOrg.mockResolvedValue({ members: [] });
            api.getOrgSlangs.mockResolvedValue([]);
            api.getTemplates.mockResolvedValue([]);

            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('Team Members')).toBeInTheDocument();
                expect(screen.getAllByText('0').length).toBeGreaterThan(0);
            });
        });

        it('should handle null org response', async () => {
            api.getOrg.mockResolvedValue(null);
            api.getOrgSlangs.mockResolvedValue([]);
            api.getTemplates.mockResolvedValue([]);

            render(<Analytics />);

            await waitFor(() => {
                expect(screen.getByText('Team Members')).toBeInTheDocument();
            });
        });
    });
});
