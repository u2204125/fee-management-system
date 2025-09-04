// Reference Management
class ReferenceManagementManager {
    constructor() {
        this.isInitialized = false;
        this.init().catch(console.error);
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.bindEvents();
        await this.refresh();
    }

    bindEvents() {
        // Add Reference Form
        const addReferenceForm = document.getElementById('addReferenceForm');
        if (addReferenceForm) {
            addReferenceForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addReference();
            });
        }

        // Add Received By Form
        const addReceivedByForm = document.getElementById('addReceivedByForm');
        if (addReceivedByForm) {
            addReceivedByForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addReceivedBy();
            });
        }
    }

    async addReference() {
        const referenceText = document.getElementById('newReference').value.trim();
        
        if (!referenceText) {
            Utils.showToast('Please enter a reference option', 'error');
            return;
        }

        try {
            const response = await fetch('/api/reference-options');
            const references = await response.json();
            
            // Check if reference already exists
            if (references.some(ref => ref.name.toLowerCase() === referenceText.toLowerCase())) {
                Utils.showToast('Reference option already exists', 'error');
                return;
            }

            // Add new reference
            const addResponse = await fetch('/api/reference-options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: referenceText })
            });

            if (addResponse.ok) {
                Utils.showToast('Reference option added successfully', 'success');
                document.getElementById('newReference').value = '';
                await this.refreshReferencesList();
                this.updateReferenceDropdowns();
            } else {
                const errorData = await addResponse.json();
                Utils.showToast(errorData.message || 'Failed to add reference option', 'error');
            }
        } catch (error) {
            Utils.showToast('Failed to add reference option', 'error');
            console.error('Error adding reference:', error);
        }
    }

    async addReceivedBy() {
        const receivedByText = document.getElementById('newReceivedBy').value.trim();
        
        if (!receivedByText) {
            Utils.showToast('Please enter a receiver name', 'error');
            return;
        }

        try {
            const response = await fetch('/api/received-by-options');
            const receivedByOptions = await response.json();
            
            // Check if receiver already exists
            if (receivedByOptions.some(opt => opt.name.toLowerCase() === receivedByText.toLowerCase())) {
                Utils.showToast('Receiver option already exists', 'error');
                return;
            }

            // Add new receiver
            const addResponse = await fetch('/api/received-by-options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: receivedByText })
            });

            if (addResponse.ok) {
                Utils.showToast('Receiver option added successfully', 'success');
                document.getElementById('newReceivedBy').value = '';
                await this.refreshReceivedByList();
                this.updateReceivedByDropdowns();
            } else {
                const errorData = await addResponse.json();
                Utils.showToast(errorData.message || 'Failed to add receiver option', 'error');
            }
        } catch (error) {
            Utils.showToast('Failed to add receiver option', 'error');
            console.error('Error adding receiver:', error);
        }
    }

    async getReferences() {
        try {
            const response = await fetch('/api/reference-options');
            if (response.ok) {
                const data = await response.json();
                return data.map(item => item.name);
            }
            return ["Cash Payment", "Bank Transfer"];
        } catch (e) {
            console.error('Error loading references:', e);
            return ["Cash Payment", "Bank Transfer"];
        }
    }

    async getReceivedByOptions() {
        try {
            const response = await fetch('/api/received-by-options');
            if (response.ok) {
                const data = await response.json();
                return data.map(item => item.name);
            }
            return ["Reception Desk"];
        } catch (e) {
            console.error('Error loading received by options:', e);
            return ["Reception Desk"];
        }
    }

    async refresh() {
        await Promise.all([
            this.refreshReferencesList(),
            this.refreshReceivedByList()
        ]);
        this.updateReferenceDropdowns();
        this.updateReceivedByDropdowns();
    }

    async refreshReferencesList() {
        await this.loadReferenceOptions();
    }

    async refreshReceivedByList() {
        await this.loadReceivedByOptions();
    }

    async loadReferenceOptions() {
        const referenceList = document.getElementById('referenceOptionsList');
        if (!referenceList) return;

        try {
            const response = await fetch('/api/reference-options');
            const references = await response.json();
            
            if (references.length === 0) {
                referenceList.innerHTML = '<p class="text-center">No reference options created yet</p>';
                return;
            }

            referenceList.innerHTML = references.map(reference => `
                <div class="entity-item">
                    <div class="entity-info">
                        <div class="entity-name">${Utils.escapeHtml(reference.name)}</div>
                    </div>
                    <div class="entity-actions">
                        <button class="btn btn-small btn-outline" onclick="referenceManagementManager.editReference('${reference._id}', '${Utils.escapeHtml(reference.name)}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="referenceManagementManager.deleteReference('${reference._id}', '${Utils.escapeHtml(reference.name)}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading reference options:', error);
            referenceList.innerHTML = '<p class="text-center text-error">Error loading reference options</p>';
        }
    }

    async loadReceivedByOptions() {
        const receivedByList = document.getElementById('receivedByOptionsList');
        if (!receivedByList) return;

        try {
            const response = await fetch('/api/received-by-options');
            const options = await response.json();
            
            if (options.length === 0) {
                receivedByList.innerHTML = '<p class="text-center">No receiver options created yet</p>';
                return;
            }

            receivedByList.innerHTML = options.map(option => `
                <div class="entity-item">
                    <div class="entity-info">
                        <div class="entity-name">${Utils.escapeHtml(option.name)}</div>
                    </div>
                    <div class="entity-actions">
                        <button class="btn btn-small btn-outline" onclick="referenceManagementManager.editReceivedBy('${option._id}', '${Utils.escapeHtml(option.name)}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="referenceManagementManager.deleteReceivedBy('${option._id}', '${Utils.escapeHtml(option.name)}')">Delete</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading received by options:', error);
            receivedByList.innerHTML = '<p class="text-center text-error">Error loading receiver options</p>';
        }
    }

    async updateReferenceDropdowns() {
        const referenceSelect = document.getElementById('referenceSelect');
        if (!referenceSelect) return;

        try {
            const references = await this.getReferences();
            
            referenceSelect.innerHTML = '<option value="">Select Reference</option>' +
                references.map(ref => `<option value="${Utils.escapeHtml(ref)}">${Utils.escapeHtml(ref)}</option>`).join('') +
                '<option value="custom">Custom</option>';
        } catch (error) {
            console.error('Error updating reference dropdown:', error);
        }
    }

    async updateReceivedByDropdowns() {
        const receivedBySelect = document.getElementById('receivedBySelect');
        if (!receivedBySelect) return;

        try {
            const receivedByOptions = await this.getReceivedByOptions();
            
            receivedBySelect.innerHTML = '<option value="">Select Receiver</option>' +
                receivedByOptions.map(option => `<option value="${Utils.escapeHtml(option)}">${Utils.escapeHtml(option)}</option>`).join('') +
                '<option value="custom">Custom</option>';
        } catch (error) {
            console.error('Error updating received by dropdown:', error);
        }
    }

    async editReference(id, currentName) {
        try {
            const newReference = prompt('Edit reference option:', currentName);
            if (newReference && newReference !== currentName) {
                const sanitizedReference = Utils.sanitizeInput(newReference);
                
                // Check if new reference already exists
                const response = await fetch('/api/reference-options');
                const references = await response.json();
                
                if (references.some(ref => ref.name.toLowerCase() === sanitizedReference.toLowerCase() && ref._id !== id)) {
                    Utils.showToast('Reference option already exists', 'error');
                    return;
                }

                const updateResponse = await fetch(`/api/reference-options/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: sanitizedReference })
                });

                if (updateResponse.ok) {
                    Utils.showToast('Reference option updated successfully', 'success');
                    await this.refresh();
                } else {
                    const errorData = await updateResponse.json();
                    Utils.showToast(errorData.message || 'Failed to update reference option', 'error');
                }
            }
        } catch (error) {
            Utils.showToast('Failed to update reference option', 'error');
            console.error('Error updating reference:', error);
        }
    }

    async editReceivedBy(id, currentName) {
        try {
            const newReceiver = prompt('Edit receiver option:', currentName);
            if (newReceiver && newReceiver !== currentName) {
                const sanitizedReceiver = Utils.sanitizeInput(newReceiver);
                
                // Check if new receiver already exists
                const response = await fetch('/api/received-by-options');
                const receivers = await response.json();
                
                if (receivers.some(rec => rec.name.toLowerCase() === sanitizedReceiver.toLowerCase() && rec._id !== id)) {
                    Utils.showToast('Receiver option already exists', 'error');
                    return;
                }

                const updateResponse = await fetch(`/api/received-by-options/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: sanitizedReceiver })
                });

                if (updateResponse.ok) {
                    Utils.showToast('Receiver option updated successfully', 'success');
                    await this.refresh();
                } else {
                    const errorData = await updateResponse.json();
                    Utils.showToast(errorData.message || 'Failed to update receiver option', 'error');
                }
            }
        } catch (error) {
            Utils.showToast('Failed to update receiver option', 'error');
            console.error('Error updating receiver:', error);
        }
    }

    async deleteReference(id, name) {
        try {
            Utils.confirm(`Are you sure you want to delete "${name}"?`, async () => {
                const deleteResponse = await fetch(`/api/reference-options/${id}`, {
                    method: 'DELETE'
                });

                if (deleteResponse.ok) {
                    Utils.showToast('Reference option deleted successfully', 'success');
                    await this.refresh();
                } else {
                    const errorData = await deleteResponse.json();
                    Utils.showToast(errorData.message || 'Failed to delete reference option', 'error');
                }
            });
        } catch (error) {
            Utils.showToast('Failed to delete reference option', 'error');
            console.error('Error deleting reference:', error);
        }
    }

    async deleteReceivedBy(id, name) {
        try {
            Utils.confirm(`Are you sure you want to delete "${name}"?`, async () => {
                const deleteResponse = await fetch(`/api/received-by-options/${id}`, {
                    method: 'DELETE'
                });

                if (deleteResponse.ok) {
                    Utils.showToast('Receiver option deleted successfully', 'success');
                    await this.refresh();
                } else {
                    const errorData = await deleteResponse.json();
                    Utils.showToast(errorData.message || 'Failed to delete receiver option', 'error');
                }
            });
        } catch (error) {
            Utils.showToast('Failed to delete receiver option', 'error');
            console.error('Error deleting receiver:', error);
        }
    }
}

// Global reference management manager instance
window.referenceManagementManager = new ReferenceManagementManager();
