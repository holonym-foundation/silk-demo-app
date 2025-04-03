function Safe() {
  return (
    <div>
      <h2>Safe Demo</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk.safe().catch((err) => console.error(err))
        }}
        className='button'
      >
        Safe
      </button>
    </div>
  )
}

export default Safe
