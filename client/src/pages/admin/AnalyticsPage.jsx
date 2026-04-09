export default function AnalyticsPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>System <span className="gradient-text">Analytics</span></h1>
          <p>Deep dive into resource utilization</p>
        </div>
      </div>
      <div className="empty-state glass-card-static" style={{ height: 400 }}>
        <div className="empty-state-icon">📈</div>
        <h3>More Analytics Coming Soon</h3>
        <p>This module is planned for a future release to show heatmaps and predictive usage.</p>
      </div>
    </div>
  );
}
