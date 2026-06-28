import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Droplets, FlaskConical, Microscope, ClipboardList } from 'lucide-react';
import { cn } from '../../utils/cn';
import { DEPARTMENTS } from '../../data/departments';
import type { DepartmentId } from '../../types';
import { useUIStore } from '../../store/uiStore';

const DEPT_ICONS: Record<DepartmentId, React.ReactNode> = {
  hematology: <Droplets className="h-4 w-4" />,
  biochemistry: <FlaskConical className="h-4 w-4" />,
  microbiology: <Microscope className="h-4 w-4" />,
  reception: <ClipboardList className="h-4 w-4" />,
};

export const DepartmentTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { departmentId } = useParams<{ departmentId: string }>();
  const { setActiveDepartment } = useUIStore();

  const currentSection = location.pathname.split('/').pop() ?? 'monthly';

  const handleDeptChange = (deptId: DepartmentId) => {
    setActiveDepartment(deptId);
    navigate(`/department/${deptId}/${currentSection}`);
  };

  if (!departmentId) return null;

  return (
    <div className="px-4 md:px-6 py-2 bg-white border-b border-slate-100 overflow-x-auto scrollbar-thin">
      <div className="flex gap-1 min-w-max">
        {DEPARTMENTS.map((dept) => {
          const isActive = departmentId === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => handleDeptChange(dept.id as DepartmentId)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
              style={isActive ? { backgroundColor: dept.color } : {}}
            >
              {DEPT_ICONS[dept.id as DepartmentId]}
              {dept.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
