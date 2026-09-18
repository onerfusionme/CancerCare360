'use client';

import React, { useState } from 'react';
import { Card, Steps, Button, message, Form, Select, DatePicker, Input, Result } from 'antd';
import { useRouter } from 'next/navigation';
import TimeSlotPicker from '@/components/appointment/TimeSlotPicker';
import { useAvailableSlots, useCreateAppointment } from '@/hooks/use-appointments';
import { usePatients } from '@/hooks/use-patients';
import { CreateAppointmentDto } from '@/types/appointment';

const { Step } = Steps;
const { Option } = Select;

const DOCTORS = [
  { id: '85d9d88d-d588-4a8c-abfb-c8e741cab162', name: 'Dr. Priya Mehta', specialty: 'Medical Oncology' },
  { id: '3527bd79-ef28-465a-bdb8-a7e4a52273a3', name: 'Dr. Rajesh Kumar', specialty: 'Surgical Oncology' },
  { id: '31d3d8ee-1011-4a7f-a185-8e0879df002b', name: 'Dr. Ananya Desai', specialty: 'Radiation Oncology' },
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  
  const { data: patientData } = usePatients();
  const patientList = Array.isArray(patientData?.data) ? patientData.data : (Array.isArray(patientData) ? patientData : []);

  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(selectedDoctor, selectedDate);
  const createMutation = useCreateAppointment();

  const next = () => {
    form.validateFields().then(() => setCurrent(current + 1)).catch(() => {});
  };
  const prev = () => setCurrent(current - 1);

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();
      const dto: CreateAppointmentDto = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        appointmentType: values.appointmentType,
        scheduledAt: selectedTime,
        durationMinutes: 30,
        notes: values.notes
      };
      await createMutation.mutateAsync(dto);
      setCurrent(current + 1);
    } catch (e) {
      message.error('Failed to book appointment');
    }
  };

  const renderContent = () => {
    switch (current) {
      case 0:
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="patientId" label="Patient" rules={[{ required: true, message: 'Please select a patient' }]}>
              <Select placeholder={patientList.length > 0 ? "Search patient..." : "No registered patients found — please register first"}>
                {patientList.map((p: any) => (
                  <Option key={p.id} value={p.id}>
                    {p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient'} ({p.mrn})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="appointmentType" label="Appointment Type" rules={[{ required: true }]}>
              <Select placeholder="Select type">
                <Option value="INITIAL_CONSULT">Initial Consultation</Option>
                <Option value="FOLLOW_UP">Follow Up Review</Option>
                <Option value="CHEMOTHERAPY">Chemotherapy Session</Option>
                <Option value="RADIATION">Radiation Planning</Option>
              </Select>
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="doctorId" label="Doctor" rules={[{ required: true, message: 'Please select an oncologist' }]}>
              <Select placeholder="Select doctor" onChange={val => setSelectedDoctor(val)}>
                {DOCTORS.map(d => (
                  <Option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker 
                style={{ width: '100%' }} 
                onChange={(date, dateString) => setSelectedDate(dateString as string)} 
              />
            </Form.Item>
          </Form>
        );
      case 2:
        return (
          <div>
            <h3 style={{ marginBottom: 16 }}>Select Time Slot</h3>
            {slotsLoading ? <p>Loading slots...</p> : (
              <TimeSlotPicker 
                slots={slots || []} 
                selectedSlot={selectedTime} 
                onSelect={setSelectedTime} 
              />
            )}
            <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
              <Form.Item name="notes" label="Notes (Optional)">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </div>
        );
      case 3:
        return (
          <Result
            status="success"
            title="Appointment Successfully Booked!"
            subTitle="The patient has been notified."
            extra={[
              <Button type="primary" key="console" onClick={() => router.push('/appointments')}>
                Go to Appointments
              </Button>,
              <Button key="buy" onClick={() => { form.resetFields(); setCurrent(0); }}>
                Book Another
              </Button>,
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2>Book Appointment</h2>
      <Card>
        <Steps current={current} style={{ marginBottom: 32 }}>
          <Step title="Patient Details" />
          <Step title="Doctor & Date" />
          <Step title="Time Slot" />
          <Step title="Confirmation" />
        </Steps>
        
        <div style={{ minHeight: 300 }}>
          {renderContent()}
        </div>

        {current < 3 && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {current > 0 && <Button onClick={prev}>Previous</Button>}
            {current < 2 && <Button type="primary" onClick={next}>Next</Button>}
            {current === 2 && (
              <Button type="primary" onClick={handleSubmit} disabled={!selectedTime} loading={createMutation.isPending}>
                Confirm Booking
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
