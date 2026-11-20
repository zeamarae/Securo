// (2026-07-13) Test authentication credentials fixture; was hardcoded values
export const TEST_CREDS = {
  student: {
    id: process.env.TEST_STUDENT_USER || '8230537',
    password: process.env.TEST_STUDENT_PASS || '8230537'
  },
  parent: {
    email: process.env.TEST_PARENT_USER || 'ayenngyabut@gmail.com',
    password: process.env.TEST_PARENT_PASS || 'alexasuzane'
  },
  admin: {
    email: process.env.TEST_ADMIN_USER || 'admin@admin.com',
    password: process.env.TEST_ADMIN_PASS || 'admin123'
  },
  staff: {
    id: process.env.TEST_STAFF_USER || '1122334',
    email: process.env.TEST_STAFF_EMAIL || 'staff@staff.com',
    password: process.env.TEST_STAFF_PASS || 'staff123'
  }
};
