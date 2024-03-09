export const onlyRejectedPromise = <T>(promise: PromiseSettledResult<T>) =>
  promise.status === 'rejected';

export const filterOnlyRejectedPromises = <Reason>(
  promises: PromiseSettledResult<unknown>[]
) => promises.filter(onlyRejectedPromise) as ({
  status: "rejected"
  reason: Reason
})[];
