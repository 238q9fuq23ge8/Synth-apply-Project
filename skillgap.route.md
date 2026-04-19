## Input JSON Example

**Endpoint:** `POST /v1/skill-gap/analyze`

**Request Body (with target role):**
```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000",
  "target_role": "Senior Full Stack Developer"
}
```

**Request Body (without target role - analyzes against industry standards only):**
```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

---

## Output JSON Example

**Response (200 OK):**
```json
{
  "current_role": "Software Engineer",
  "target_role": "Senior Full Stack Developer",
  "current_skills": [
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "Git",
    "HTML",
    "CSS"
  ],
  "missing_skills": [
    {
      "skill": "Python",
      "priority": "high",
      "gap_basis": "target_role",
      "reason": "Required for Senior Full Stack Developer role as many companies expect full stack developers to be proficient in multiple backend languages",
      "courses": [
        {
          "name": "Python Bootcamp on Udemy",
          "platform": "Udemy",
          "description": "Complete Python programming course covering fundamentals to advanced topics including web development with Django and Flask"
        },
        {
          "name": "Python for Data Science on Coursera",
          "platform": "Coursera",
          "description": "Learn Python programming for data analysis and machine learning applications"
        },
        {
          "name": "Advanced Python Programming on edX",
          "platform": "edX",
          "description": "Deep dive into Python advanced features, design patterns, and best practices"
        }
      ]
    },
    {
      "skill": "Docker",
      "priority": "high",
      "gap_basis": "industry_standard",
      "reason": "Industry standard for modern software engineering roles - essential for containerization and deployment",
      "courses": [
        {
          "name": "Docker Mastery Course on Udemy",
          "platform": "Udemy",
          "description": "Complete Docker containerization course covering Docker, Docker Compose, and Kubernetes"
        },
        {
          "name": "Docker and Kubernetes on Coursera",
          "platform": "Coursera",
          "description": "Learn containerization technologies and orchestration with Kubernetes"
        }
      ]
    },
    {
      "skill": "AWS",
      "priority": "medium",
      "gap_basis": "target_role",
      "reason": "Senior roles typically require cloud platform expertise for deployment and infrastructure management",
      "courses": [
        {
          "name": "AWS Certified Solutions Architect on Udemy",
          "platform": "Udemy",
          "description": "Comprehensive AWS course covering EC2, S3, Lambda, and other core AWS services"
        },
        {
          "name": "AWS Cloud Practitioner on Coursera",
          "platform": "Coursera",
          "description": "Learn AWS fundamentals and cloud computing concepts"
        }
      ]
    },
    {
      "skill": "GraphQL",
      "priority": "low",
      "gap_basis": "industry_standard",
      "reason": "Modern API technology that's becoming increasingly popular in full stack development",
      "courses": [
        {
          "name": "GraphQL with React on Udemy",
          "platform": "Udemy",
          "description": "Learn GraphQL API development and integration with React applications"
        }
      ]
    }
  ],
  "recommendations": "To advance to a Senior Full Stack Developer role, focus on learning Python as a second backend language, mastering Docker for containerization, and gaining AWS cloud platform expertise. These skills will significantly enhance your marketability and align with industry expectations for senior positions. Start with high-priority skills like Python and Docker, then gradually build cloud expertise.",
  "credits_remaining": 95
}
```

---

## Example without target role

**Request:**
```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "current_role": "Frontend Developer",
  "target_role": null,
  "current_skills": [
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "TypeScript"
  ],
  "missing_skills": [
    {
      "skill": "Testing (Jest, React Testing Library)",
      "priority": "high",
      "gap_basis": "industry_standard",
      "reason": "Industry standard for Frontend Developer roles - essential for writing maintainable and reliable code",
      "courses": [
        {
          "name": "React Testing Library Course on Udemy",
          "platform": "Udemy",
          "description": "Learn how to write effective tests for React applications using Jest and React Testing Library"
        },
        {
          "name": "JavaScript Testing Fundamentals on Coursera",
          "platform": "Coursera",
          "description": "Master JavaScript testing with Jest, Mocha, and other testing frameworks"
        }
      ]
    },
    {
      "skill": "Next.js",
      "priority": "medium",
      "gap_basis": "industry_standard",
      "reason": "Modern React framework widely used in production applications - expected knowledge for experienced frontend developers",
      "courses": [
        {
          "name": "Next.js Complete Guide on Udemy",
          "platform": "Udemy",
          "description": "Master Next.js framework including SSR, SSG, API routes, and deployment"
        }
      ]
    }
  ],
  "recommendations": "As a Frontend Developer, focus on adding testing skills to your toolkit. This is critical for industry standards. Additionally, learning Next.js will expand your React expertise and make you more competitive in the job market. Consider starting with testing fundamentals before moving to framework-specific skills.",
  "credits_remaining": 95
}
```

---

## Error Response Examples

**400 Bad Request (CV not parsed):**
```json
{
  "detail": "CV must be parsed first. Please use /v1/ai/parse-cv endpoint to parse your CV."
}
```

**402 Payment Required (Insufficient credits):**
```json
{
  "detail": "Insufficient credits. You need 5 credits but have 2. Please upgrade your plan."
}
```

**403 Forbidden (CV doesn't belong to user):**
```json
{
  "detail": "You don't have access to this CV"
}
```

**404 Not Found (CV not found):**
```json
{
  "detail": "CV not found"
}
```

**401 Unauthorized (Invalid token):**
```json
{
  "detail": "Invalid or expired token"
}
```