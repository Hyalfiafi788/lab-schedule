import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, User, Clock, Umbrella, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useStaffStore } from '../../store/staffStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useUIStore } from '../../store/uiStore';
import { useToast } from '../../components/ui/toast-context';
import type { DepartmentId, Staff } from '../../types';
import { getDepartmentById } from '../../data/departments';
import { computeMonthlyStats } from '../../utils/schedule';
import { exportIndividualPDF } from '../../utils/export';
import { useSettingsStore } from '../../store/settingsStore';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ShiftBadge } from '../../components/schedule/ShiftBadge';
import type { ShiftType } from '../../types';
import dayjs from 'dayjs';

interface StaffFormData {
  name: string;
  role: string;
  employeeNumber: string;
  email: string;
  phone: string;
  vacationBalance: number;
  joinDate: string;
}

export const StaffPage = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const deptId = departmentId as DepartmentId;

  const { getStaffByDepartment, addStaff, updateStaff, removeStaff } = useStaffStore();
  const { getStaffMonthEntries, getDepartmentMonthEntries } = useScheduleStore();
  const { currentMonth } = useUIStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();

  const dept = getDepartmentById(deptId);
  const staff = getStaffByDepartment(deptId);

  const [searchQuery, setSearchQuery] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Staff | null>(null);
  const [profileModal, setProfileModal] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StaffFormData>();

  const onAddSubmit = (data: StaffFormData) => {
    addStaff({
      ...data,
      departmentId: deptId,
      isActive: true,
      vacationBalance: Number(data.vacationBalance),
    });
    toast(`${data.name} added to ${dept.name}`, 'success');
    setAddModal(false);
    reset();
  };

  const onEditSubmit = (data: StaffFormData) => {
    if (!editModal) return;
    updateStaff(editModal.id, {
      ...data,
      vacationBalance: Number(data.vacationBalance),
    });
    toast(`${data.name} updated successfully`, 'success');
    setEditModal(null);
    reset();
  };

  const handleOpenEdit = (member: Staff) => {
    setValue('name', member.name);
    setValue('role', member.role);
    setValue('employeeNumber', member.employeeNumber ?? '');
    setValue('email', member.email ?? '');
    setValue('phone', member.phone ?? '');
    setValue('vacationBalance', member.vacationBalance);
    setValue('joinDate', member.joinDate ?? '');
    setEditModal(member);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    removeStaff(deleteConfirm.id);
    toast(`${deleteConfirm.name} removed`, 'info');
    setDeleteConfirm(null);
  };

  const handleExportIndividual = (member: Staff) => {
    const entries = getStaffMonthEntries(member.id, currentMonth);
    exportIndividualPDF(member, entries, currentMonth, settings.hospitalName);
    toast('PDF downloaded', 'success');
  };

  const getStaffStats = (member: Staff) => {
    const entries = getDepartmentMonthEntries(deptId, currentMonth);
    return computeMonthlyStats(member, entries, currentMonth);
  };

  const StaffForm = ({ onSubmit, submitLabel }: { onSubmit: (d: StaffFormData) => void; submitLabel: string }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Full Name"
          placeholder="Enter full name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Role / Position"
          placeholder="e.g. Lab Technician"
          error={errors.role?.message}
          {...register('role', { required: 'Role is required' })}
        />
        <Input
          label="Employee Number"
          placeholder="e.g. HEMA-001"
          {...register('employeeNumber')}
        />
        <Input
          label="Vacation Balance (days)"
          type="number"
          placeholder="21"
          {...register('vacationBalance')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="email@hospital.com"
          {...register('email')}
        />
        <Input
          label="Phone"
          placeholder="+966 5xx xxx xxxx"
          {...register('phone')}
        />
        <Input
          label="Join Date"
          type="date"
          {...register('joinDate')}
          className="sm:col-span-2"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => { setAddModal(false); setEditModal(null); reset(); }}
        >
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
            <h2 className="text-xl font-bold text-slate-900">{dept.name}</h2>
          </div>
          <p className="text-sm text-slate-500">{staff.length} staff members</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="sm:w-56"
          />
          <Button onClick={() => { reset(); setAddModal(true); }} size="sm">
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Staff grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredStaff.map((member, idx) => {
            const stats = getStaffStats(member);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="card-hover overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: dept.color }} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar name={member.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{member.role}</p>
                        {member.employeeNumber && (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {member.employeeNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(member)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Monthly stats mini */}
                    <div className="grid grid-cols-4 gap-1 mb-3">
                      {[
                        { label: 'M', val: stats.morningCount, color: '#15803d', bg: '#dcfce7' },
                        { label: 'E', val: stats.eveningCount, color: '#1d4ed8', bg: '#dbeafe' },
                        { label: 'N', val: stats.nightCount, color: '#6d28d9', bg: '#ede9fe' },
                        { label: 'OFF', val: stats.offCount, color: '#4b5563', bg: '#f3f4f6' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-lg py-1.5 text-center"
                          style={{ backgroundColor: s.bg }}
                        >
                          <div className="text-base font-bold" style={{ color: s.color }}>{s.val}</div>
                          <div className="text-[9px] font-semibold" style={{ color: s.color }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Info row */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stats.totalWorkingHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Umbrella className="h-3 w-3" />
                        {member.vacationBalance}d VAC
                      </span>
                      {member.joinDate && (
                        <span className="hidden sm:flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {dayjs(member.joinDate).format('MMM YY')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-3">
                      <button
                        onClick={() => setProfileModal(member)}
                        className="flex-1 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleExportIndividual(member)}
                        className="flex-1 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
                      >
                        Export PDF
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No staff found</p>
          <p className="text-sm">Try a different search or add new staff</p>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        open={addModal}
        onClose={() => { setAddModal(false); reset(); }}
        title="Add New Staff Member"
        description={`Adding to ${dept.name}`}
        size="lg"
      >
        <StaffForm onSubmit={onAddSubmit} submitLabel="Add Staff" />
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        open={!!editModal}
        onClose={() => { setEditModal(null); reset(); }}
        title="Edit Staff Member"
        size="lg"
      >
        <StaffForm onSubmit={onEditSubmit} submitLabel="Save Changes" />
      </Modal>

      {/* Profile Modal */}
      {profileModal && (
        <Modal
          open={!!profileModal}
          onClose={() => setProfileModal(null)}
          title={profileModal.name}
          description={profileModal.role}
          size="lg"
        >
          <StaffProfileContent
            member={profileModal}
            departmentId={deptId}
            currentMonth={currentMonth}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remove Staff Member"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-4">
          Are you sure you want to remove <strong>{deleteConfirm?.name}</strong>? This will not delete their schedule history.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Staff Profile content component
const StaffProfileContent = ({
  member,
  departmentId,
  currentMonth,
}: {
  member: Staff;
  departmentId: DepartmentId;
  currentMonth: string;
}) => {
  const { getDepartmentMonthEntries } = useScheduleStore();
  const entries = getDepartmentMonthEntries(departmentId, currentMonth);
  const stats = computeMonthlyStats(member, entries, currentMonth);
  const staffEntries = entries.filter((e) => e.staffId === member.id);

  const statItems = [
    { label: 'Morning Shifts', value: stats.morningCount, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Evening Shifts', value: stats.eveningCount, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Night Shifts', value: stats.nightCount, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Days Off', value: stats.offCount, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Vacation Days', value: stats.vacationCount, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sick Leave', value: stats.sickCount, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Working Hours', value: `${stats.totalWorkingHours}h`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Vacation Balance', value: `${member.vacationBalance}d`, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="flex items-center gap-4">
        <Avatar name={member.name} size="lg" />
        <div>
          <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
          <p className="text-slate-500">{member.role}</p>
          <div className="flex gap-2 mt-1.5">
            {member.employeeNumber && <Badge variant="info">{member.employeeNumber}</Badge>}
            {member.joinDate && (
              <Badge variant="secondary">Since {dayjs(member.joinDate).format('MMM YYYY')}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Monthly stats grid */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">
          {dayjs(currentMonth + '-01').format('MMMM YYYY')} Statistics
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statItems.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent shifts */}
      {staffEntries.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Schedule This Month</p>
          <div className="flex flex-wrap gap-1.5">
            {staffEntries.slice(0, 20).map((e) => (
              <div key={e.date} className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-slate-400">{dayjs(e.date).date()}</span>
                <ShiftBadge shift={e.shift as ShiftType} size="xs" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
