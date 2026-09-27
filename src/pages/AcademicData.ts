export type Section = {
  name: string
  adviser: string
  room: string
  schedule: string
  capacity: number
}

export type YearGroup = {
  name: string
  sections: Section[]
}

export type Course = {
  id: string
  code: string
  name: string
  duration: string
  yearGroups: YearGroup[]
}

export type Department = {
  id: string
  name: string
  courses: Course[]
}

export type EducationLevel = {
  id: string
  name: string
  description: string
  departments: Department[]
}

export const tertiarySubjects = [
  'Introduction to Computing',
  'Computer Programming',
  'Mathematics in the Modern World',
  'Purposive Communication',
]

export const secondarySubjects = [
  'Oral Communication',
  'General Mathematics',
  'Earth and Life Science',
  'Personal Development',
]

export const initialAcademicLevels: EducationLevel[] = [
  {
    id: 'tertiary',
    name: 'Tertiary Education',
    description: 'College degree programs',
    departments: [
      {
        id: 'information-technology',
        name: 'Information Technology',
        courses: [
          {
            id: 'bsit',
            code: 'BSIT',
            name: 'Bachelor of Science in Information Technology',
            duration: '4 years',
            yearGroups: [
              { name: 'Year 1', sections: [{ name: 'BSIT 1A', adviser: 'Roberto Villanueva', room: 'IT Lab 1', schedule: 'Mon - Thu, 8:00 AM', capacity: 35 }] },
              { name: 'Year 2', sections: [{ name: 'BSIT 2A', adviser: 'Paolo Reyes', room: 'Room 204', schedule: 'Mon - Thu, 10:00 AM', capacity: 35 }] },
              { name: 'Year 3', sections: [{ name: 'BSIT 3A', adviser: 'Roberto Villanueva', room: 'IT Lab 2', schedule: 'Tue - Fri, 8:00 AM', capacity: 32 }] },
              { name: 'Year 4', sections: [{ name: 'BSIT 4A', adviser: 'Paolo Reyes', room: 'Room 205', schedule: 'Tue - Fri, 1:00 PM', capacity: 30 }] },
            ],
          },
        ],
      },
      {
        id: 'business-management',
        name: 'Business and Management',
        courses: [
          {
            id: 'bsba',
            code: 'BSBA',
            name: 'Bachelor of Science in Business Administration',
            duration: '4 years',
            yearGroups: [
              { name: 'Year 1', sections: [{ name: 'BSBA 1A', adviser: 'Catherine Dizon', room: 'Room 101', schedule: 'Mon - Thu, 8:00 AM', capacity: 40 }] },
              { name: 'Year 2', sections: [{ name: 'BSBA 2A', adviser: 'Catherine Dizon', room: 'Room 102', schedule: 'Mon - Thu, 10:00 AM', capacity: 38 }] },
              { name: 'Year 3', sections: [{ name: 'BSBA 3A', adviser: 'Maria Santos', room: 'Room 103', schedule: 'Tue - Fri, 8:00 AM', capacity: 35 }] },
              { name: 'Year 4', sections: [{ name: 'BSBA 4A', adviser: 'Maria Santos', room: 'Room 104', schedule: 'Tue - Fri, 1:00 PM', capacity: 32 }] },
            ],
          },
        ],
      },
      {
        id: 'education',
        name: 'Education',
        courses: [
          {
            id: 'beed',
            code: 'BEED',
            name: 'Bachelor of Elementary Education',
            duration: '4 years',
            yearGroups: [
              { name: 'Year 1', sections: [{ name: 'BEED 1A', adviser: 'Maria Santos', room: 'Room 110', schedule: 'Mon - Thu, 8:00 AM', capacity: 35 }] },
              { name: 'Year 2', sections: [{ name: 'BEED 2A', adviser: 'Maria Santos', room: 'Room 111', schedule: 'Mon - Thu, 10:00 AM', capacity: 35 }] },
              { name: 'Year 3', sections: [{ name: 'BEED 3A', adviser: 'Josephine Cruz', room: 'Room 112', schedule: 'Tue - Fri, 8:00 AM', capacity: 32 }] },
              { name: 'Year 4', sections: [{ name: 'BEED 4A', adviser: 'Josephine Cruz', room: 'Room 113', schedule: 'Tue - Fri, 1:00 PM', capacity: 30 }] },
            ],
          },
          {
            id: 'bsed',
            code: 'BSED',
            name: 'Bachelor of Secondary Education',
            duration: '4 years',
            yearGroups: [
              { name: 'Year 1', sections: [{ name: 'BSED 1A', adviser: 'Josephine Cruz', room: 'Room 114', schedule: 'Mon - Thu, 8:00 AM', capacity: 35 }] },
              { name: 'Year 2', sections: [{ name: 'BSED 2A', adviser: 'Josephine Cruz', room: 'Room 115', schedule: 'Mon - Thu, 10:00 AM', capacity: 35 }] },
              { name: 'Year 3', sections: [{ name: 'BSED 3A', adviser: 'Maria Santos', room: 'Room 116', schedule: 'Tue - Fri, 8:00 AM', capacity: 32 }] },
              { name: 'Year 4', sections: [{ name: 'BSED 4A', adviser: 'Maria Santos', room: 'Room 117', schedule: 'Tue - Fri, 1:00 PM', capacity: 30 }] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'secondary',
    name: 'Secondary Education',
    description: 'Senior High School strands',
    departments: [
      {
        id: 'senior-high-school',
        name: 'Senior High School Department',
        courses: [
          {
            id: 'stem',
            code: 'STEM',
            name: 'Science, Technology, Engineering, and Mathematics',
            duration: '2 years',
            yearGroups: [
              { name: 'Grade 11', sections: [{ name: 'STEM 11A', adviser: 'Althea Ramos', room: 'SHS 201', schedule: 'Mon - Fri, 8:00 AM', capacity: 40 }] },
              { name: 'Grade 12', sections: [{ name: 'STEM 12A', adviser: 'Althea Ramos', room: 'SHS 202', schedule: 'Mon - Fri, 1:00 PM', capacity: 38 }] },
            ],
          },
          {
            id: 'abm',
            code: 'ABM',
            name: 'Accountancy, Business, and Management',
            duration: '2 years',
            yearGroups: [
              { name: 'Grade 11', sections: [{ name: 'ABM 11A', adviser: 'Gabriel Santos', room: 'SHS 203', schedule: 'Mon - Fri, 8:00 AM', capacity: 40 }] },
              { name: 'Grade 12', sections: [{ name: 'ABM 12A', adviser: 'Gabriel Santos', room: 'SHS 204', schedule: 'Mon - Fri, 1:00 PM', capacity: 38 }] },
            ],
          },
          {
            id: 'humss',
            code: 'HUMSS',
            name: 'Humanities and Social Sciences',
            duration: '2 years',
            yearGroups: [
              { name: 'Grade 11', sections: [{ name: 'HUMSS 11A', adviser: 'Kyla Villanueva', room: 'SHS 205', schedule: 'Mon - Fri, 8:00 AM', capacity: 40 }] },
              { name: 'Grade 12', sections: [{ name: 'HUMSS 12A', adviser: 'Kyla Villanueva', room: 'SHS 206', schedule: 'Mon - Fri, 1:00 PM', capacity: 38 }] },
            ],
          },
          {
            id: 'tvl-ict',
            code: 'TVL-ICT',
            name: 'Technical-Vocational-Livelihood - Information and Communications Technology',
            duration: '2 years',
            yearGroups: [
              { name: 'Grade 11', sections: [{ name: 'TVL-ICT 11A', adviser: 'Nathan Flores', room: 'ICT Lab', schedule: 'Mon - Fri, 8:00 AM', capacity: 35 }] },
              { name: 'Grade 12', sections: [{ name: 'TVL-ICT 12A', adviser: 'Nathan Flores', room: 'ICT Lab', schedule: 'Mon - Fri, 1:00 PM', capacity: 32 }] },
            ],
          },
        ],
      },
    ],
  },
]
