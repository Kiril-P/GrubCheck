import type { InternalStatus } from "@grubcheck/domain";

export const StatusBoard = ({ status }: { status: InternalStatus }) => (
  <div className="status-grid">
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h2>Recent Runs</h2>
        </div>
        <p>{status.recentRuns.length} tracked jobs</p>
      </div>
      <div className="status-list">
        {status.recentRuns.map((run) => (
          <article key={run.id} className="status-card">
            <div>
              <strong>{run.job}</strong>
              <p>{run.status}</p>
            </div>
            <div>
              <span>Cursor {run.cursor}</span>
              <span>{run.finishedAt ? "Finished" : "Active"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Review Queue</p>
          <h2>Match Reviews</h2>
        </div>
        <p>{status.matchReviews.length} unresolved</p>
      </div>
      <div className="status-list">
        {status.matchReviews.map((review) => (
          <article key={review.id} className="status-card">
            <div>
              <strong>{review.marketHashName}</strong>
              <p>{review.reason}</p>
            </div>
            <div>
              <span>{Math.round(review.confidence * 100)}%</span>
              <span>{new Date(review.createdAt).toLocaleString()}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
    <section className="panel metrics-panel">
      <div className="metric">
        <span>Unpublished wearables</span>
        <strong>{status.unpublishedWearables}</strong>
      </div>
      <div className="metric">
        <span>Failed imports</span>
        <strong>{status.failedImports}</strong>
      </div>
    </section>
  </div>
);

