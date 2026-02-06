import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Templates from './Templates';
import * as api from '../services/api';

// Mock the API
jest.mock('../services/api');

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('Templates Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading text initially', () => {
            api.getTemplates.mockImplementation(() => new Promise(() => { }));

            render(<Templates />);
            expect(screen.getByText('Loading templates...')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty message when no templates exist', async () => {
            api.getTemplates.mockResolvedValue([]);

            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText(/No templates yet/i)).toBeInTheDocument();
            });
        });
    });

    describe('Templates Display', () => {
        const mockTemplates = [
            { id: '1', name: 'Meeting Invite', content: 'Join our meeting', channel: 'EMAIL' },
            { id: '2', name: 'Follow Up', content: 'Following up on...', channel: 'WHATSAPP' }
        ];

        beforeEach(() => {
            api.getTemplates.mockResolvedValue(mockTemplates);
        });

        it('should display template names', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('Meeting Invite')).toBeInTheDocument();
                expect(screen.getByText('Follow Up')).toBeInTheDocument();
            });
        });

        it('should display template content', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('Join our meeting')).toBeInTheDocument();
            });
        });

        it('should display channel badges', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('EMAIL')).toBeInTheDocument();
                expect(screen.getByText('WHATSAPP')).toBeInTheDocument();
            });
        });
    });

    describe('Create Template', () => {
        beforeEach(() => {
            api.getTemplates.mockResolvedValue([]);
            api.createTemplate.mockResolvedValue({ id: 'new', name: 'New Template', content: 'Content', channel: 'EMAIL' });
        });

        it('should show form when clicking New Template', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('+ New Template')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('+ New Template'));
            expect(screen.getByPlaceholderText(/Template name/i)).toBeInTheDocument();
        });

        it('should create template on form submit', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('+ New Template')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('+ New Template'));

            const nameInput = screen.getByPlaceholderText(/Template name/i);
            const contentInput = screen.getByPlaceholderText(/Template content/i);

            await userEvent.type(nameInput, 'Test Template');
            await userEvent.type(contentInput, 'Test content');

            fireEvent.click(screen.getByText('Save Template'));

            await waitFor(() => {
                expect(api.createTemplate).toHaveBeenCalled();
            });
        });
    });

    describe('Delete Template', () => {
        beforeEach(() => {
            api.getTemplates.mockResolvedValue([
                { id: '1', name: 'Test', content: 'Content', channel: 'EMAIL' }
            ]);
            api.deleteTemplate.mockResolvedValue({});
        });

        it('should call delete API when delete is clicked', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Delete'));

            await waitFor(() => {
                expect(api.deleteTemplate).toHaveBeenCalledWith('1');
            });
        });
    });

    describe('Copy Template', () => {
        beforeEach(() => {
            api.getTemplates.mockResolvedValue([
                { id: '1', name: 'Test', content: 'Copy this content', channel: 'EMAIL' }
            ]);
        });

        it('should copy content to clipboard on copy click', async () => {
            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('Test')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Copy'));

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy this content');
        });
    });

    describe('Error Handling', () => {
        it('should show error when load fails', async () => {
            api.getTemplates.mockRejectedValue(new Error('Network error'));

            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to load templates/i)).toBeInTheDocument();
            });
        });

        it('should show error when create fails', async () => {
            api.getTemplates.mockResolvedValue([]);
            api.createTemplate.mockRejectedValue(new Error('Create failed'));

            render(<Templates />);

            await waitFor(() => {
                expect(screen.getByText('+ New Template')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('+ New Template'));

            const nameInput = screen.getByPlaceholderText(/Template name/i);
            const contentInput = screen.getByPlaceholderText(/Template content/i);

            await userEvent.type(nameInput, 'Test');
            await userEvent.type(contentInput, 'Content');

            fireEvent.click(screen.getByText('Save Template'));

            await waitFor(() => {
                expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
            });
        });
    });
});
