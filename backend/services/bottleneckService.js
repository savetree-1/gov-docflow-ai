const AuditLog = require("../models/AuditLog");
const Department = require("../models/Department");
const Document = require("../models/Document");

exports.getBottleneckData = async () => {
  // Count actual documents in each department
  const departments = await Department.find();
  
  const results = await Promise.all(departments.map(async (dept) => {
    // Count documents currently assigned to this department
    const documentCount = await Document.countDocuments({ 
      department: dept._id,
      isDeleted: { $ne: true }
    });
    
    // Count pending/in-progress documents
    const pendingCount = await Document.countDocuments({ 
      department: dept._id,
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
      isDeleted: { $ne: true }
    });
    
    // Calculate processing capacity utilization
    const utilizationPercent = documentCount > 0 ? Math.round((documentCount / 20) * 100) : 0;
    
    return {
      departmentName: dept.name,
      processedCount: documentCount,
      pendingCount: pendingCount,
      utilizationPercent: Math.min(utilizationPercent, 100),
      bottleneckScore: Math.min(pendingCount * 10, 100),
      status: pendingCount > 10 ? "High Risk" : pendingCount > 5 ? "Medium" : "Normal",
    };
  }));

  return results.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
};
