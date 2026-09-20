'use client';

import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Typography,
  Space,
  Card,
  Table,
  Tag,
  Badge,
  Descriptions,
  Button,
  Row,
  Col,
  Input,
  Select,
  Popconfirm,
  message,
  Tooltip,
  Avatar,
  Divider,
  Modal,
  Form,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SettingOutlined,
  UserAddOutlined,
  TeamOutlined,
  ReloadOutlined,
  SearchOutlined,
  MailOutlined,
  KeyOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { adminRbacService, StaffUser, RoleData } from '@/services/admin-rbac.service';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { CreateRoleModal } from '@/components/admin/CreateRoleModal';

const { Title, Text, Paragraph } = Typography;

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [editUserForm] = Form.useForm();

  // Resend action loading map
  const [resendingMap, setResendingMap] = useState<Record<string, boolean>>({});

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await adminRbacService.getUsers({ limit: 100 });
      setUsers(res?.data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const data = await adminRbacService.getRoles();
      setRoles(data || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleResendCredentials = async (user: StaffUser) => {
    try {
      setResendingMap((prev) => ({ ...prev, [user.id]: true }));
      const res = await adminRbacService.resendCredentials(user.id);
      message.success(`New credentials generated and dispatched to ${user.email}! (Temp Password: ${res.data?.temporaryPassword})`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to resend credentials.');
    } finally {
      setResendingMap((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminRbacService.toggleUserStatus(user.id, nextStatus as any);
      message.success(`Account status for ${user.firstName} ${user.lastName} updated to ${nextStatus}`);
      fetchUsers();
    } catch (err: any) {
      message.error('Failed to toggle status.');
    }
  };

  const openEditUserModal = (user: StaffUser) => {
    setEditingUser(user);
    editUserForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      roleIds: user.roles || [],
    });
    setIsEditUserModalOpen(true);
  };

  const handleEditUserSubmit = async (values: any) => {
    if (!editingUser) return;
    try {
      await adminRbacService.updateUser(editingUser.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        roleIds: values.roleIds,
      });
      message.success('Staff user updated successfully');
      setIsEditUserModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user: StaffUser) => {
    try {
      await adminRbacService.deleteUser(user.id);
      message.success(`Staff user ${user.firstName} ${user.lastName} removed from system`);
      fetchUsers();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteRole = async (role: RoleData) => {
    try {
      await adminRbacService.deleteRole(role.id);
      message.success(`Role ${role.name} deleted.`);
      fetchRoles();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Cannot delete role.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' || u.roles?.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (roleName: string) => {
    const map: Record<string, string> = {
      ADMIN: 'volcano',
      SYSTEM_ADMIN: 'magenta',
      ONCOLOGIST: 'blue',
      SURGICAL_ONCOLOGIST: 'geekblue',
      RADIATION_ONCOLOGIST: 'purple',
      CARE_COORDINATOR: 'cyan',
      NURSE: 'teal',
      PATHOLOGIST: 'orange',
      RADIOLOGIST: 'gold',
    };
    return map[roleName] || 'purple';
  };

  // Extract unique module names from permissions (e.g. PATIENT:READ -> Patient Directory)
  const getRoleAccessibleModules = (perms: string[]) => {
    const resources = Array.from(new Set(perms.map((p) => p.split(':')[0])));
    return resources.map((r) => r.replace(/_/g, ' '));
  };

  return (
    <div style={{ padding: '24px 32px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
              Super Admin Settings & RBAC Governance
            </Title>
            <Text type="secondary">
              Configure role-based access control, provision staff accounts, dispatch onboarding login credentials, and manage platform permissions.
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsUserModalOpen(true)}
              style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 700 }}
            >
              Provision New Staff User
            </Button>
            <Button
              icon={<SafetyCertificateOutlined />}
              onClick={() => {
                setEditingRole(null);
                setIsRoleModalOpen(true);
              }}
              style={{ fontWeight: 600 }}
            >
              Create Custom Role
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchUsers();
                fetchRoles();
              }}
              title="Refresh Directory"
            />
          </Space>
        </div>

        {/* Top Summary KPI Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                Total Staff Users
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
                {users.length}
              </div>
              <div style={{ fontSize: 11, color: '#6366f1', marginTop: 2 }}>Provisioned accounts</div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                Active Accounts
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                {users.filter((u) => u.status === 'ACTIVE').length}
              </div>
              <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>Enabled login access</div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                Access Roles (RBAC)
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>
                {roles.length}
              </div>
              <div style={{ fontSize: 11, color: '#0369a1', marginTop: 2 }}>
                {roles.filter((r) => !r.isSystem).length} custom, {roles.filter((r) => r.isSystem).length} system
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card className="glass-card" style={{ borderRadius: 14 }} styles={{ body: { padding: '16px' } }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>
                Email Onboarding Service
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                Active
              </div>
              <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>Automated credentials dispatch</div>
            </Card>
          </Col>
        </Row>

        {/* Main Tabs Container */}
        <Card className="glass-card" style={{ borderRadius: 16 }}>
          <Tabs
            defaultActiveKey="users"
            size="large"
            items={[
              {
                key: 'users',
                label: (
                  <span>
                    <TeamOutlined style={{ marginRight: 6 }} /> Staff Directory & Credential Provisioning
                  </span>
                ),
                children: (
                  <div>
                    {/* Toolbar */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <Space wrap size={12}>
                        <Input
                          placeholder="Search staff name or login email..."
                          prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ width: 280 }}
                          allowClear
                        />
                        <Select
                          value={roleFilter}
                          onChange={setRoleFilter}
                          style={{ width: 200 }}
                        >
                          <Select.Option value="ALL">All Roles</Select.Option>
                          {roles.map((r) => (
                            <Select.Option key={r.id} value={r.name}>
                              {r.name.replace(/_/g, ' ')}
                            </Select.Option>
                          ))}
                        </Select>
                      </Space>

                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => setIsUserModalOpen(true)}
                        style={{ background: '#4f46e5', borderColor: '#4f46e5', fontWeight: 600 }}
                      >
                        Add Staff Member
                      </Button>
                    </div>

                    {/* Users Table */}
                    <Table
                      dataSource={filteredUsers}
                      rowKey="id"
                      loading={isLoadingUsers}
                      pagination={{ pageSize: 10 }}
                      columns={[
                        {
                          title: 'Staff Member',
                          key: 'name',
                          render: (_, record) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <Avatar
                                style={{
                                  backgroundColor: record.status === 'ACTIVE' ? '#4f46e5' : '#94a3b8',
                                  fontWeight: 700,
                                }}
                              >
                                {record.firstName[0]}
                                {record.lastName[0]}
                              </Avatar>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>
                                  {record.firstName} {record.lastName}
                                </div>
                                <div style={{ fontSize: 11, opacity: 0.65 }}>
                                  {record.phone || 'No phone recorded'}
                                </div>
                              </div>
                            </div>
                          ),
                        },
                        {
                          title: 'Login ID (Email)',
                          dataIndex: 'email',
                          key: 'email',
                          render: (val) => (
                            <Space size={6}>
                              <MailOutlined style={{ opacity: 0.5 }} />
                              <span style={{ fontWeight: 600 }}>{val}</span>
                            </Space>
                          ),
                        },
                        {
                          title: 'Role(s)',
                          dataIndex: 'roles',
                          key: 'roles',
                          render: (rolesList: string[]) => (
                            <Space wrap size={4}>
                              {rolesList && rolesList.length > 0 ? (
                                rolesList.map((r) => (
                                  <Tag key={r} color={getRoleColor(r)} style={{ fontWeight: 600 }}>
                                    {r.replace(/_/g, ' ')}
                                  </Tag>
                                ))
                              ) : (
                                <Tag>No Role</Tag>
                              )}
                            </Space>
                          ),
                        },
                        {
                          title: 'Department',
                          dataIndex: 'department',
                          key: 'department',
                          render: (dept) => (dept ? dept.name : <span style={{ opacity: 0.5 }}>General</span>),
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (val) => (
                            <Badge
                              status={val === 'ACTIVE' ? 'success' : 'default'}
                              text={<span style={{ fontWeight: 600 }}>{val}</span>}
                            />
                          ),
                        },
                        {
                          title: 'Created',
                          dataIndex: 'createdAt',
                          key: 'createdAt',
                          render: (val) => new Date(val).toLocaleDateString(),
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: (_, record) => (
                            <Space size={8}>
                              <Tooltip title="Generates a new secure temporary password and dispatches an email with the software login link.">
                                <Button
                                  size="small"
                                  icon={<MailOutlined />}
                                  loading={resendingMap[record.id]}
                                  onClick={() => handleResendCredentials(record)}
                                >
                                  Resend Credentials
                                </Button>
                              </Tooltip>
                              <Button
                                size="small"
                                danger={record.status === 'ACTIVE'}
                                onClick={() => handleToggleStatus(record)}
                              >
                                {record.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => openEditUserModal(record)}
                                title="Edit User"
                              >
                                Edit
                              </Button>
                              <Popconfirm
                                title="Delete Staff User"
                                description={`Permanently delete user account for ${record.firstName} ${record.lastName}?`}
                                onConfirm={() => handleDeleteUser(record)}
                                okText="Yes, Delete"
                                cancelText="No"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  title="Delete User"
                                />
                              </Popconfirm>
                            </Space>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: 'roles',
                label: (
                  <span>
                    <SafetyCertificateOutlined style={{ marginRight: 6 }} /> Role-Based Access Control (RBAC)
                  </span>
                ),
                children: (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div>
                        <Text type="secondary">
                          Define specialized oncology roles and assign exact module permissions (view, edit, manage) to control what features each staff member can access.
                        </Text>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingRole(null);
                          setIsRoleModalOpen(true);
                        }}
                        style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
                      >
                        Create New Role
                      </Button>
                    </div>

                    <Row gutter={[16, 16]}>
                      {roles.map((role) => {
                        const accessibleModules = getRoleAccessibleModules(role.permissions || []);

                        return (
                          <Col xs={24} md={12} lg={8} key={role.id}>
                            <Card
                              className="glass-card"
                              style={{
                                borderRadius: 14,
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                              styles={{ body: { padding: '20px' } }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <span style={{ fontWeight: 800, fontSize: 16 }}>
                                      {role.name.replace(/_/g, ' ')}
                                    </span>
                                    {role.isSystem ? (
                                      <Tag color="blue" style={{ marginLeft: 8, fontSize: 10, fontWeight: 700 }}>
                                        System Role
                                      </Tag>
                                    ) : (
                                      <Tag color="green" style={{ marginLeft: 8, fontSize: 10, fontWeight: 700 }}>
                                        Custom Role
                                      </Tag>
                                    )}
                                  </div>
                                  <Badge
                                    count={`${role.userCount} staff`}
                                    style={{ backgroundColor: '#6366f1', fontSize: 11 }}
                                  />
                                </div>

                                <Paragraph
                                  type="secondary"
                                  style={{ fontSize: 12.5, marginTop: 8, marginBottom: 12, minHeight: 38 }}
                                >
                                  {role.description || 'General oncology platform access role.'}
                                </Paragraph>

                                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', marginBottom: 6 }}>
                                  Accessible Modules ({accessibleModules.length})
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 56 }}>
                                  {accessibleModules.slice(0, 6).map((m) => (
                                    <Tag key={m} style={{ fontSize: 11, borderRadius: 4 }}>
                                      {m}
                                    </Tag>
                                  ))}
                                  {accessibleModules.length > 6 && (
                                    <Tag style={{ fontSize: 11, borderRadius: 4, opacity: 0.7 }}>
                                      +{accessibleModules.length - 6} more
                                    </Tag>
                                  )}
                                </div>
                              </div>

                              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => {
                                    setEditingRole(role);
                                    setIsRoleModalOpen(true);
                                  }}
                                >
                                  Edit Permissions
                                </Button>

                                {!role.isSystem && role.userCount === 0 && (
                                  <Popconfirm
                                    title="Delete Role"
                                    description={`Are you sure you want to delete "${role.name}"?`}
                                    onConfirm={() => handleDeleteRole(role)}
                                  >
                                    <Button size="small" danger icon={<DeleteOutlined />}>
                                      Delete
                                    </Button>
                                  </Popconfirm>
                                )}
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                ),
              },
              {
                key: 'departments',
                label: (
                  <span>
                    <ApartmentOutlined style={{ marginRight: 6 }} /> Departments & Facilities
                  </span>
                ),
                children: (
                  <div>
                    <Table
                      dataSource={[
                        { id: 1, name: 'Medical Oncology', head: 'Dr. Priya Mehta', clinics: 4, staffCount: 8, status: 'Active' },
                        { id: 2, name: 'Surgical Oncology', head: 'Dr. Rajesh Kumar', clinics: 3, staffCount: 5, status: 'Active' },
                        { id: 3, name: 'Radiation Oncology', head: 'Dr. Ananya Desai', clinics: 2, staffCount: 6, status: 'Active' },
                        { id: 4, name: 'Pathology & Molecular Labs', head: 'Dr. Neha Verma', clinics: 1, staffCount: 4, status: 'Active' },
                        { id: 5, name: 'Care Navigation & Coordination', head: 'Sister Sunita', clinics: 2, staffCount: 7, status: 'Active' },
                        { id: 6, name: 'Hospital Administration & Billing', head: 'Administrator', clinics: 1, staffCount: 3, status: 'Active' },
                      ]}
                      rowKey="id"
                      pagination={false}
                      columns={[
                        { title: 'Department', dataIndex: 'name', key: 'name', render: (val) => <span style={{ fontWeight: 700 }}>{val}</span> },
                        { title: 'Department Head', dataIndex: 'head', key: 'head' },
                        { title: 'Exam / Clinic Rooms', dataIndex: 'clinics', key: 'clinics' },
                        { title: 'Active Staff', dataIndex: 'staffCount', key: 'staffCount' },
                        { title: 'Status', dataIndex: 'status', key: 'status', render: (val) => <Badge status="processing" text={val} /> },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: 'governance',
                label: (
                  <span>
                    <AuditOutlined style={{ marginRight: 6 }} /> AI Governance & Protocols
                  </span>
                ),
                children: (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Card
                          hoverable
                          onClick={() => router.push('/admin/ai')}
                          style={{ borderLeft: '4px solid #4f46e5' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <RobotOutlined style={{ color: '#4f46e5', fontSize: 18 }} />
                                <span style={{ fontWeight: 700, fontSize: 15 }}>AI Clinical Governance Console</span>
                              </div>
                              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                Audit §30 non-autonomous decision support, confidence thresholds, and oncologist acceptance logs.
                              </Text>
                            </div>
                            <ArrowRightOutlined style={{ color: '#4f46e5' }} />
                          </div>
                        </Card>
                      </Col>

                      <Col xs={24} md={12}>
                        <Card
                          hoverable
                          onClick={() => router.push('/gaps/rules')}
                          style={{ borderLeft: '4px solid #0284c7' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <SettingOutlined style={{ color: '#0284c7', fontSize: 18 }} />
                                <span style={{ fontWeight: 700, fontSize: 15 }}>Care Gap Protocol Rules</span>
                              </div>
                              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                Configure triggers, days overdue thresholds, and escalation weights for missed chemotherapy/radiation milestones.
                              </Text>
                            </div>
                            <ArrowRightOutlined style={{ color: '#0284c7' }} />
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </Space>

      {/* User Provisioning Modal */}
      <CreateUserModal
        open={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          fetchRoles();
        }}
        roles={roles}
      />

      {/* Role Creation / Editing Modal */}
      <CreateRoleModal
        open={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSuccess={() => {
          fetchRoles();
        }}
        editingRole={editingRole}
      />

      {/* Staff User Editing Modal */}
      <Modal
        title="Edit Staff User Account"
        open={isEditUserModalOpen}
        onCancel={() => {
          setIsEditUserModalOpen(false);
          setEditingUser(null);
        }}
        footer={null}
        width={550}
      >
        <Form form={editUserForm} layout="vertical" onFinish={handleEditUserSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="+91 98765 43210" />
          </Form.Item>
          <Form.Item name="roleIds" label="Role(s)" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select roles">
              {roles.map(r => (
                <Select.Option key={r.id} value={r.id}>
                  {r.name.replace(/_/g, ' ')}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Save Changes</Button>
              <Button onClick={() => {
                setIsEditUserModalOpen(false);
                setEditingUser(null);
              }}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
