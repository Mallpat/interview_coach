// Comprehensive directory of Engineering Branches, Target Interview Roles, and Default Skills

export const ENGINEERING_BRANCHES = [
  {
    id: 'cs',
    name: 'Computer Science & Software (CSE)',
    shortName: 'CS / Software',
    roles: [
      {
        id: 'Full Stack Engineer',
        name: 'Full Stack Engineer',
        description: 'Frontend, backend APIs, databases, and end-to-end web architecture',
        skills: ['React', 'Node.js', 'TypeScript', 'System Design', 'PostgreSQL', 'Docker', 'REST APIs']
      },
      {
        id: 'Frontend Engineer',
        name: 'Frontend Engineer',
        description: 'Modern reactive web UI, state management, and web performance',
        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Web Performance (CWV)', 'Redux / Zustand', 'HTML5 / CSS3']
      },
      {
        id: 'Backend Engineer',
        name: 'Backend Engineer',
        description: 'High-throughput microservices, API contracts, caching, and databases',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'System Design', 'Redis', 'REST & GraphQL APIs', 'Docker']
      },
      {
        id: 'Systems & Low-Level Engineer',
        name: 'Systems & Low-Level Engineer',
        description: 'Kernel-level programming, memory allocation, multi-threading, and hardware interop',
        skills: ['C', 'C++', 'Linux Kernel', 'Memory Management', 'Multithreading & Concurrency', 'GDB / LLDB', 'POSIX APIs']
      },
      {
        id: 'Mobile App Developer',
        name: 'Mobile App Developer',
        description: 'Cross-platform and native mobile applications for iOS and Android',
        skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX', 'State Management', 'REST APIs']
      },
      {
        id: 'Cloud & DevOps Engineer',
        name: 'Cloud & DevOps Engineer',
        description: 'Infrastructure as Code, container orchestration, and continuous delivery',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Linux Administration', 'Prometheus & Grafana']
      },
      {
        id: 'Cybersecurity & InfoSec Engineer',
        name: 'Cybersecurity & InfoSec Engineer',
        description: 'Threat modeling, application security, penetration testing, and compliance',
        skills: ['Network Security', 'OWASP Top 10', 'Penetration Testing', 'Cryptography', 'SIEM & SOC Analysis', 'Linux Hardening']
      }
    ]
  },
  {
    id: 'it',
    name: 'Information Technology (IT)',
    shortName: 'IT & Infrastructure',
    roles: [
      {
        id: 'IT Infrastructure & Systems Engineer',
        name: 'IT Infrastructure & Systems Engineer',
        description: 'Enterprise server administration, identity management, and virtualization',
        skills: ['Active Directory / LDAP', 'Windows Server', 'Linux Administration', 'VMware / Hyper-V', 'Bash & PowerShell', 'Backup & Disaster Recovery']
      },
      {
        id: 'Network & Security Engineer',
        name: 'Network & Security Engineer',
        description: 'Enterprise network topology, routing, firewall policies, and traffic analysis',
        skills: ['Cisco CCNA/CCNP', 'TCP/IP & Subnetting', 'Firewalls & VPNs', 'Routing & Switching', 'Wireshark', 'DNS / DHCP / VLANs']
      },
      {
        id: 'Database Administrator (DBA)',
        name: 'Database Administrator (DBA)',
        description: 'Database engine tuning, replication, backup/recovery, and schema governance',
        skills: ['SQL', 'PostgreSQL', 'MySQL', 'Database Tuning & Indexing', 'High Availability Replication', 'Backup & Recovery']
      },
      {
        id: 'Cloud Solutions Architect',
        name: 'Cloud Solutions Architect',
        description: 'Enterprise multi-cloud architecture, migration, and cost governance',
        skills: ['AWS Solutions Architecture', 'Microsoft Azure', 'Cloud Migration', 'Microservices', 'Disaster Recovery', 'Cost Optimization']
      },
      {
        id: 'IT Enterprise Operations & Support',
        name: 'IT Enterprise Operations & Support',
        description: 'ITIL incident response, ticketing workflow, and endpoint provisioning',
        skills: ['ITIL Framework', 'ServiceNow', 'Hardware Diagnostics', 'Endpoint Management', 'SLA Management', 'Troubleshooting']
      }
    ]
  },
  {
    id: 'ai_ml',
    name: 'Artificial Intelligence & Machine Learning (AI & ML)',
    shortName: 'AI & ML / Data',
    roles: [
      {
        id: 'AI & Machine Learning Engineer',
        name: 'AI & Machine Learning Engineer',
        description: 'Training, evaluating, and serving predictive machine learning models in production',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Feature Engineering', 'Model Deployment', 'Data Preprocessing']
      },
      {
        id: 'Generative AI & LLM Engineer',
        name: 'Generative AI & LLM Engineer',
        description: 'LLM fine-tuning, RAG pipelines, prompt architecture, and agentic workflows',
        skills: ['LangChain / LlamaIndex', 'RAG Architecture', 'Vector Databases', 'Prompt Engineering', 'Hugging Face', 'Gemini API']
      },
      {
        id: 'Data Scientist',
        name: 'Data Scientist',
        description: 'Statistical modeling, exploratory data analysis, and predictive insights',
        skills: ['Python', 'SQL', 'Pandas & NumPy', 'Statistical Analysis', 'A/B Testing', 'Data Visualization', 'Machine Learning']
      },
      {
        id: 'Data Engineer',
        name: 'Data Engineer',
        description: 'Scalable data lakes, distributed data streaming, and automated ETL workflows',
        skills: ['Apache Spark', 'Kafka', 'SQL', 'Data Pipelines (Airflow)', 'BigQuery / Snowflake', 'Data Warehousing', 'Python']
      },
      {
        id: 'Computer Vision Engineer',
        name: 'Computer Vision Engineer',
        description: 'Image and video recognition, object detection, segmentation, and camera feeds',
        skills: ['OpenCV', 'PyTorch', 'YOLO', 'Convolutional Neural Networks (CNNs)', 'Image Segmentation', 'Edge AI (TensorRT)']
      },
      {
        id: 'NLP (Natural Language Processing) Engineer',
        name: 'NLP (Natural Language Processing) Engineer',
        description: 'Text classification, entity extraction, sentiment analysis, and tokenization',
        skills: ['Transformers', 'Hugging Face', 'BERT', 'SpaCy / NLTK', 'Tokenization & Embeddings', 'Text Classification']
      }
    ]
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    roles: [
      {
        id: 'Mechanical Design Engineer',
        name: 'Mechanical Design Engineer',
        description: '3D CAD modeling, GD&T tolerancing, mechanism design, and rapid prototyping',
        skills: ['SolidWorks', 'AutoCAD', 'GD&T (ASME Y14.5)', 'Machine Design', 'DFMA (Design for Mfg)', 'Rapid Prototyping']
      },
      {
        id: 'Thermal & Fluid Systems Engineer',
        name: 'Thermal & Fluid Systems Engineer',
        description: 'Heat exchanger design, fluid dynamics, CFD simulation, and HVAC calculation',
        skills: ['Thermodynamics', 'Heat Transfer', 'Fluid Mechanics', 'ANSYS Fluent (CFD)', 'HVAC Design', 'Cooling Systems']
      },
      {
        id: 'FEA & Structural Simulation Engineer',
        name: 'FEA & Structural Simulation Engineer',
        description: 'Finite element stress analysis, vibrational fatigue, and material durability',
        skills: ['ANSYS Mechanical', 'Finite Element Analysis (FEA)', 'Stress & Strain Analysis', 'HyperMesh', 'Fatigue & Durability', 'Material Mechanics']
      },
      {
        id: 'Manufacturing & Production Engineer',
        name: 'Manufacturing & Production Engineer',
        description: 'CNC toolpaths, lean manufacturing, assembly optimization, and quality assurance',
        skills: ['CNC Machining / G-Code', 'Lean Manufacturing & Kaizen', 'Six Sigma (DMAIC)', 'Quality Control (QC/QA)', 'Injection Molding', 'Process Optimization']
      },
      {
        id: 'Automotive & Powertrain Engineer',
        name: 'Automotive & Powertrain Engineer',
        description: 'Vehicle dynamics, powertrain calibration, chassis design, and NVH analysis',
        skills: ['Vehicle Dynamics', 'Powertrain Systems', 'MATLAB / Simulink', 'CATIA V5', 'NVH (Noise/Vibration/Harshness)', 'Chassis Design']
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical & Electronics Engineering (EEE / ECE)',
    shortName: 'Electrical / ECE',
    roles: [
      {
        id: 'Embedded Systems & Firmware Engineer',
        name: 'Embedded Systems & Firmware Engineer',
        description: 'Low-level microcontroller firmware, real-time operating systems, and device drivers',
        skills: ['Embedded C', 'ARM Cortex-M', 'STM32 / ESP32', 'FreeRTOS', 'I2C / SPI / UART', 'Oscilloscopes & Logic Analyzers']
      },
      {
        id: 'VLSI & Digital ASIC Design Engineer',
        name: 'VLSI & Digital ASIC Design Engineer',
        description: 'Digital logic synthesis, RTL verification, FPGA emulation, and timing closure',
        skills: ['Verilog / SystemVerilog', 'VHDL', 'FPGA Programming', 'Cadence / Synopsys EDA', 'Static Timing Analysis (STA)', 'RTL Verification']
      },
      {
        id: 'Hardware & PCB Design Engineer',
        name: 'Hardware & PCB Design Engineer',
        description: 'High-speed schematic capture, multi-layer PCB layout, and EMC/EMI compliance',
        skills: ['Altium Designer', 'KiCAD', 'Circuit Simulation (SPICE)', 'High-Speed PCB Layout', 'EMC / EMI Compliance', 'Component Sourcing']
      },
      {
        id: 'Power Electronics & Energy Systems Engineer',
        name: 'Power Electronics & Energy Systems Engineer',
        description: 'Inverters, power converters, battery management (BMS), and renewable grid tie-in',
        skills: ['Power Electronics (Buck/Boost)', 'Inverters & Rectifiers', 'MATLAB / Simulink', 'Battery Management Systems (BMS)', 'High-Voltage Safety', 'Electric Motors & Drives']
      },
      {
        id: 'IoT & Wireless Communications Engineer',
        name: 'IoT & Wireless Communications Engineer',
        description: 'Connected smart devices, RF wireless protocols, and cloud sensor telemetry',
        skills: ['ESP32 & Arduino', 'BLE (Bluetooth Low Energy)', 'Zigbee & LoRaWAN', 'MQTT & HTTP Protocols', 'Sensor Interfacing', 'Edge Processing']
      }
    ]
  },
  {
    id: 'civil',
    name: 'Civil & Structural Engineering',
    shortName: 'Civil & Structural',
    roles: [
      {
        id: 'Structural Design Engineer',
        name: 'Structural Design Engineer',
        description: 'Reinforced concrete, structural steel, seismic loading, and building code compliance',
        skills: ['STAAD.Pro', 'ETABS', 'AutoCAD', 'RCC Design', 'Structural Steel Design', 'Seismic & Wind Load Analysis', 'IS / ACI Codes']
      },
      {
        id: 'Construction & Site Project Engineer',
        name: 'Construction & Site Project Engineer',
        description: 'On-site execution, subcontractor coordination, cost estimation, and schedule tracking',
        skills: ['Site Supervision & Inspection', 'Project Scheduling (Primavera/MS Project)', 'Quantity Surveying & Estimation', 'Quality Assurance (QA/QC)', 'OSHA Safety Standards']
      },
      {
        id: 'Geotechnical & Transportation Engineer',
        name: 'Geotechnical & Transportation Engineer',
        description: 'Foundation soil mechanics, highway alignment, and pavement layer calculations',
        skills: ['Soil Mechanics & Testing', 'Foundation Engineering', 'Highway Geometric Design', 'Civil 3D', 'Traffic Engineering', 'GIS Mapping']
      }
    ]
  },
  {
    id: 'robotics',
    name: 'Robotics & Automation Engineering',
    shortName: 'Robotics & Automation',
    roles: [
      {
        id: 'Robotics & Autonomous Systems Engineer',
        name: 'Robotics & Autonomous Systems Engineer',
        description: 'Kinematics, SLAM navigation, trajectory planning, and robot operating system nodes',
        skills: ['ROS / ROS 2', 'C++', 'Python', 'Kinematics & Dynamics', 'Motion Planning (MoveIt)', 'SLAM & Sensor Fusion', 'LiDAR & Depth Cameras']
      },
      {
        id: 'Industrial Automation & PLC Engineer',
        name: 'Industrial Automation & PLC Engineer',
        description: 'Ladder logic, factory automation, SCADA dashboards, and conveyor/sensor integration',
        skills: ['PLC Programming (Siemens / Rockwell)', 'SCADA & HMI Design', 'Industrial Sensors & Actuators', 'PID Loop Tuning', 'Modbus / Profinet', 'Industrial Safety Standards']
      }
    ]
  },
  {
    id: 'chemical',
    name: 'Chemical & Process Engineering',
    shortName: 'Chemical & Process',
    roles: [
      {
        id: 'Chemical Process Design Engineer',
        name: 'Chemical Process Design Engineer',
        description: 'Continuous chemical plant simulation, mass/heat transfer, and reactor design',
        skills: ['Aspen Plus / HYSYS', 'P&ID and PFD Development', 'Mass & Heat Balance', 'Distillation & Reaction Engineering', 'Process Safety & HAZOP', 'Fluid Dynamics']
      },
      {
        id: 'Petrochemical & Refining Engineer',
        name: 'Petrochemical & Refining Engineer',
        description: 'Downstream refinery operations, catalytic cracking, and separation column optimization',
        skills: ['Refinery Unit Operations', 'Catalysis & Cracking', 'Piping & Instrumentation', 'Safety Instrumented Systems (SIS)', 'Process Control Systems', 'Plant Commissioning']
      }
    ]
  },
  {
    id: 'aerospace',
    name: 'Aerospace & Aeronautical Engineering',
    shortName: 'Aerospace',
    roles: [
      {
        id: 'Aerodynamics & Flight Mechanics Engineer',
        name: 'Aerodynamics & Flight Mechanics Engineer',
        description: 'Airfoil performance, supersonic shock waves, stability derivatives, and wind tunnels',
        skills: ['Aerodynamics & Airfoil Design', 'Compressible Fluid Dynamics', 'ANSYS Fluent', 'Flight Dynamics & Stability', 'Wind Tunnel Data Analysis', 'MATLAB']
      },
      {
        id: 'Propulsion & Avionics Systems Engineer',
        name: 'Propulsion & Avionics Systems Engineer',
        description: 'Turbofan cycle calculation, rocket engine nozzles, flight control laws, and cockpit avionics',
        skills: ['Gas Turbine Propulsion', 'Rocket Engine Fundamentals', 'Avionics Systems (DO-178C)', 'Flight Control Systems', 'Thermodynamic Cycle Analysis', 'SolidWorks / CATIA']
      }
    ]
  },
  {
    id: 'biomedical',
    name: 'Biomedical Engineering',
    shortName: 'Biomedical',
    roles: [
      {
        id: 'Biomedical Equipment & Instrumentation Engineer',
        name: 'Biomedical Instrumentation Engineer',
        description: 'Medical imaging instrumentation, biosensors, patient monitoring, and FDA medical device compliance',
        skills: ['Biosensors & Bio-signals (ECG/EEG)', 'Medical Imaging (MRI / CT / Ultrasound)', 'ISO 13485 & FDA 510(k) Standards', 'Physiological Signal Processing', 'Microcontroller Interfacing', 'Biocompatible Materials']
      }
    ]
  }
];

// Flat list of all roles
export const ALL_ROLES = ENGINEERING_BRANCHES.flatMap(branch => 
  branch.roles.map(role => ({
    ...role,
    branchId: branch.id,
    branchName: branch.name,
    branchShortName: branch.shortName
  }))
);

// Map of canonical role identifiers to default skills
export const ROLE_SKILLS_MAP = {};
ALL_ROLES.forEach(role => {
  ROLE_SKILLS_MAP[role.id] = role.skills;
});

// Legacy / alias lookups for backward compatibility
const LEGACY_ROLE_ALIASES = {
  'frontend': 'Frontend Engineer',
  'frontend engineer': 'Frontend Engineer',
  'backend': 'Backend Engineer',
  'backend engineer': 'Backend Engineer',
  'full stack': 'Full Stack Engineer',
  'full stack engineer': 'Full Stack Engineer',
  'full stack developer': 'Full Stack Engineer',
  'data': 'Data Engineer',
  'data engineer': 'Data Engineer',
  'devops': 'Cloud & DevOps Engineer',
  'devops engineer': 'Cloud & DevOps Engineer',
  'system architect': 'Cloud Solutions Architect',
  'ai / ml engineer': 'AI & Machine Learning Engineer',
  'ai/ml engineer': 'AI & Machine Learning Engineer',
  'mechanical': 'Mechanical Design Engineer',
  'electrical': 'Embedded Systems & Firmware Engineer',
  'civil': 'Structural Design Engineer'
};

/**
 * Get default skills for a given role name or identifier
 */
export const getDefaultSkillsForRole = (roleIdentifier) => {
  if (!roleIdentifier || typeof roleIdentifier !== 'string') {
    return ['React', 'Node.js', 'System Design'];
  }

  // Exact match
  if (ROLE_SKILLS_MAP[roleIdentifier]) {
    return [...ROLE_SKILLS_MAP[roleIdentifier]];
  }

  // Normalized match
  const lower = roleIdentifier.trim().toLowerCase();
  if (LEGACY_ROLE_ALIASES[lower] && ROLE_SKILLS_MAP[LEGACY_ROLE_ALIASES[lower]]) {
    return [...ROLE_SKILLS_MAP[LEGACY_ROLE_ALIASES[lower]]];
  }

  // Search in flat list
  const found = ALL_ROLES.find(r => 
    r.id.toLowerCase() === lower || 
    r.name.toLowerCase() === lower ||
    r.id.toLowerCase().includes(lower) ||
    lower.includes(r.id.toLowerCase())
  );

  if (found) {
    return [...found.skills];
  }

  // Default fallback
  return ['System Architecture', 'Problem Solving', 'Technical Documentation'];
};

/**
 * Get the branch object for a given role
 */
export const getBranchForRole = (roleIdentifier) => {
  if (!roleIdentifier) return ENGINEERING_BRANCHES[0];
  const lower = roleIdentifier.trim().toLowerCase();
  const canonicalId = LEGACY_ROLE_ALIASES[lower] || roleIdentifier;

  const branch = ENGINEERING_BRANCHES.find(b => 
    b.roles.some(r => r.id.toLowerCase() === lower || r.id === canonicalId || r.name.toLowerCase() === lower)
  );

  return branch || ENGINEERING_BRANCHES[0];
};
