/****** Alert Assets Export ******/
export const Success = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310B981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'%3E%3C/path%3E%3C/svg%3E";

export const Error = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23EF4444'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12'%3E%3C/path%3E%3C/svg%3E";

export const Status = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12'%3E%3C/path%3E%3C/svg%3E";

/****** Export error and success message components ******/
export const SuccessMsg = ({ message }) => (
  <div style={{
    padding: '12px 16px',
    background: '#DEF7EC',
    border: '1px solid #84E1BC',
    borderRadius: '6px',
    color: '#03543F',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span>{message}</span>
  </div>
);

export const ErrorMsg = ({ message }) => (
  <div style={{
    padding: '12px 16px',
    background: '#FDE8E8',
    border: '1px solid #F98080',
    borderRadius: '6px',
    color: '#9B1C1C',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span>{message}</span>
  </div>
);
