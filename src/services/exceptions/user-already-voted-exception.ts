export class UserAlreadyVotedException extends Error {
  constructor() {
    super('User already voted')
  }
}
