const AuditLog = require("../models/AuditLog");
const Department = require("../models/Department");

exports.getBottleneckData = async () => {
 
  const logs = await AuditLog.find({
    action: { $in: ["FORWARDED", "APPROVED", "REJECTED"] },
  }).sort({ timestamp: 1 });

  const deptStats = {};

  // 2. Simple Algorithm: Calculate time taken for each action
  // (In a real app, you'd match "RECEIVED" vs "FORWARDED" pairs)
  // For now, we simulate "Processing Time" based on user activity density

  // Group logs by Department
  logs.forEach((log) => {
    if (!log.departmentId) return;

    if (!deptStats[log.departmentId]) {
      deptStats[log.departmentId] = { count: 0, totalTime: 0 };
    }

    // logic to calculate time diff would go here
    // For MVP: We count "Pending" documents as potential bottlenecks
    deptStats[log.departmentId].count++;
  });

  // 3. Format for Frontend
  const departments = await Department.find();
  const results = departments.map((dept) => {
    const stats = deptStats[dept._id] || { count: 0 };
    return {
      departmentName: dept.name,
      processedCount: stats.count,
      // Mocking a "Risk Score" (0-100) based on load
      bottleneckScore: Math.min(stats.count * 5, 100),
      status: stats.count > 10 ? "High Risk" : "Normal",
    };
  });

  return results.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
};
