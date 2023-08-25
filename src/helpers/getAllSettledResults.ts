const getAllSettledResults = <Data, Error = unknown>(promises: PromiseSettledResult<unknown>[]) => {
  const result = {
    fulfilled: [] as Data[],
    rejected: [] as Error[]
  }

  return promises.reduce<typeof result>((acc, curr) => {
    if (curr.status === 'fulfilled') {
      acc.fulfilled.push(curr.value as Data);
    }
    if (curr.status === 'rejected') {
      acc.rejected.push(curr.reason)
    }
    return acc;
  }, result)
}

export default getAllSettledResults
