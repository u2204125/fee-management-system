// Payment Service
class PaymentService {
    async generateInvoiceNumber() {
        const response = await fetch('/api/payments/generate-invoice');
        const data = await response.json();
        return data.invoiceNumber;
    }

    async getPayments() {
        const response = await fetch('/api/payments');
        return await response.json();
    }

    async addPayment(paymentData) {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        return await response.json();
    }

    async getPaymentsByStudent(studentId) {
        const response = await fetch(`/api/payments/student/${studentId}`);
        return await response.json();
    }

    async getMonthPaymentDetails(studentId) {
        const response = await fetch(`/api/payments/student/${studentId}/months`);
        return await response.json();
    }

    async getDiscountedPayments() {
        const response = await fetch('/api/payments/discounted');
        return await response.json();
    }
}

// Global instance
window.paymentService = new PaymentService();
