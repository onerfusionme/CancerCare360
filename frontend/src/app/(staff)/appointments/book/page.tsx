'use client';

import React, { useState } from 'react';
import { Card, Steps, Button, message, Form, Select, DatePicker, Input, Result } from 'antd';
import { useRouter } from 'next/navigation';
import TimeSlotPicker from '@/components/appointment/TimeSlotPicker';
import { useAvailableSlots, useCreateAppointment } from '@/hooks/use-appointments';
import { CreateAppointmentDto } from '@/types/appointment';

const { Step } = Steps;
const { Option } = Select;

export default function BookAppointmentPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  
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
        departmentId: 'dep1', // mock
        appointmentType: values.appointmentType,
        scheduledAt: selectedTime,
        durationMinutes: 30, // mock
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
              <Select placeholder="Search patient...">
                <Option value="pat1">John Doe (MRN: 12345)</Option>
                <Option value="pat2">Jane Smith (MRN: 67890)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="appointmentType" label="Appointment Type" rules={[{ required: true }]}>
              <Select placeholder="Select type">
                <Option value="FOLLOW_UP">Follow Up</Option>
                <Option value="INITIAL_CONSULT">Initial Consultation</Option>
              </Select>
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="doctorId" label="Doctor" rules={[{ required: true }]}>
              <Select placeholder="Select doctor" onChange={val => setSelectedDoctor(val)}>
                <Option value="doc1">Dr. Smith</Option>
                <Option value="doc2">Dr. Jones</Option>
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
