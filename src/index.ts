interface Student {
  id: number,
  name: string,
  GPA?: number,
}

const sam: Student = { id: 2022, name: 'Sam', GPA: 1000 };

const students: Student[] = [sam];

console.log(students);
