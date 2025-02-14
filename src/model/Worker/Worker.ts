// Role interface for worker's role
interface Role {
  id: number;
  name: string;
}

// Worker interface
interface Worker {
  id: number;
  name: string;
  phoneNumber: string;
  employeeNumber: string;
  email: string;
  gender: 'male' | 'female';
  address: string;
  profilePhoto: string;
  dob: string;
  status: 'active' | 'quitJob' | 'onLeave';
  roleId: Role;
}
