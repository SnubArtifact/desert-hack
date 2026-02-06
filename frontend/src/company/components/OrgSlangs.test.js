import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrgSlangs from './OrgSlangs';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Mock the API and Auth context
jest.mock('../services/api');
jest.mock('../context/AuthContext');

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('OrgSlangs Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('No Organization', () => {
        it('should show message for user without org', () => {
            useAuth.mockReturnValue({ user: { role: 'MEMBER' } });

            render(<OrgSlangs />);
            expect(screen.getByText(/Join an organization/i)).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading while fetching slangs', async () => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockImplementation(() => new Promise(() => { }));

            render(<OrgSlangs />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty message when no slangs exist for admin', async () => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockResolvedValue([]);

            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText(/No slangs yet.*Add the first one/i)).toBeInTheDocument();
            });
        });

        it('should show empty message without add prompt for member', async () => {
            useAuth.mockReturnValue({
                user: { role: 'MEMBER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockResolvedValue([]);

            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText(/No slangs yet/i)).toBeInTheDocument();
            });
        });
    });

    describe('Slangs Display', () => {
        const mockSlangs = [
            { id: '1', slang: 'yaar', meaning: 'friend', isApproved: true },
            { id: '2', slang: 'jugaad', meaning: 'creative workaround', isApproved: false }
        ];

        beforeEach(() => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockResolvedValue(mockSlangs);
        });

        it('should display slang words and meanings', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('"yaar"')).toBeInTheDocument();
                expect(screen.getByText('= friend')).toBeInTheDocument();
            });
        });

        it('should show pending badge for unapproved slangs', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('Pending')).toBeInTheDocument();
            });
        });
    });

    describe('Admin Actions', () => {
        beforeEach(() => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 'test', meaning: 'test meaning', isApproved: false }
            ]);
            api.approveOrgSlang.mockResolvedValue({});
            api.deleteOrgSlang.mockResolvedValue({});
            api.addOrgSlang.mockResolvedValue({});
        });

        it('should show add form for admin', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/Slang/i)).toBeInTheDocument();
                expect(screen.getByPlaceholderText(/Meaning/i)).toBeInTheDocument();
            });
        });

        it('should show approve button for pending slangs', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('Approve')).toBeInTheDocument();
            });
        });

        it('should call approve API when clicking approve', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('Approve')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Approve'));

            await waitFor(() => {
                expect(api.approveOrgSlang).toHaveBeenCalledWith('1');
            });
        });

        it('should call delete API when clicking delete', async () => {
            // Ensure confirm returns true
            window.confirm = jest.fn(() => true);

            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('×')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('×'));

            await waitFor(() => {
                expect(api.deleteOrgSlang).toHaveBeenCalledWith('1');
            });
        });
    });

    describe('Add Slang', () => {
        beforeEach(() => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockResolvedValue([]);
            api.addOrgSlang.mockResolvedValue({});
        });

        it('should add slang when form is submitted', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/Slang/i)).toBeInTheDocument();
            });

            await userEvent.type(screen.getByPlaceholderText(/Slang/i), 'fundae');
            await userEvent.type(screen.getByPlaceholderText(/Meaning/i), 'fundamentals');

            fireEvent.click(screen.getByText('Add'));

            await waitFor(() => {
                expect(api.addOrgSlang).toHaveBeenCalledWith('fundae', 'fundamentals');
            });
        });
    });

    describe('Export CSV', () => {
        beforeEach(() => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
        });

        it('should show export button', async () => {
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 'test', meaning: 'test meaning', isApproved: true }
            ]);

            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('Export CSV')).toBeInTheDocument();
            });
        });

        it('should alert when no approved slangs to export', async () => {
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 'test', meaning: 'test meaning', isApproved: false }
            ]);

            global.alert = jest.fn();

            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('Export CSV')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Export CSV'));

            expect(global.alert).toHaveBeenCalledWith('No approved slangs to export');
        });
    });

    describe('Member View', () => {
        beforeEach(() => {
            useAuth.mockReturnValue({
                user: { role: 'MEMBER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockResolvedValue([
                { id: '1', slang: 'test', meaning: 'test meaning', isApproved: true }
            ]);
        });

        it('should not show add form for member', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('"test"')).toBeInTheDocument();
            });

            expect(screen.queryByPlaceholderText(/Slang/i)).not.toBeInTheDocument();
        });

        it('should not show approve/delete buttons for member', async () => {
            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('"test"')).toBeInTheDocument();
            });

            expect(screen.queryByText('Approve')).not.toBeInTheDocument();
            expect(screen.queryByText('×')).not.toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should show error when load fails', async () => {
            useAuth.mockReturnValue({
                user: { role: 'OWNER', org: { name: 'Test Org' } }
            });
            api.getOrgSlangs.mockRejectedValue(new Error('Network error'));

            render(<OrgSlangs />);

            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });
    });
});
