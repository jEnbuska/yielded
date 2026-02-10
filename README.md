# Yielded

A TypeScript library for composing and transforming values from synchronous iterables, and asynchronous generators through a uniform pipeline API.

Operations are lazy — they don’t process the entire sequence up front. Each input value flows through the pipeline one at a time as you consume the output, enabling efficient handling of large and asynchronous sources.

It extends the native [Iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/Iterator) API, and provides the same capabilities also for handling [AsyncIterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator)s *(with a few exceptions when it comes to parallel iterations)*.



### High level example

```ts
import { Yielded } from "yielded";

...
const getPageOfCustomers = async (
    pagination: PaginationArgs<Customer>, 
    organizationId: string
) => {
  const { page, pageSize, sortBy, sortDirection, signal, } = pagination;
  return Yielded.from(getContractors(organizationId))
      // Allow up to 5 concurrent calls to getContractorCustomers
    .parallel(5)
    .flatMap(async (contractor) => {
      const {contractorId} = contractor;
      const customers = await getContractorCustomers(contractorId, { signal });
      return customers.map((customer) => ({...customer, contractorId }));
    })
    // Back to 1 concurrency for the rest of the pipeline
    .awaited()
    .filter((customer) => customer.isActive)
    // Handle returing one pageful of customers ata time 
    .sorted(createComparator({ locale, sortBy, sortDirection }))
    .drop(page * pageSize)
    .take(pageSize)
    // Abort all work upstream if the signal is aborted
    .withSignal(signal) 
    .toArray();
}
```
