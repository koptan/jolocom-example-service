import { AppConfig } from '../config/config'
import { controller, httpPost } from 'inversify-express-utils'
import { ClaimsMetadataProvider } from '../credential/claimsMetadataProvider'
import { StaticCredentialOfferProvider } from '../credential/offer/staticCredentialOfferProvider'
import { SdkAgentFactory } from '../sdk/sdkAgentFactory'
import { RequestDescriptionFactory } from '../interaction/requestDescriptionFactory'
import { Request } from 'express'
import { inject } from 'inversify'
import { TYPES } from '../types'
import { CredentialOfferRequest } from '../credential/offer/credentialOfferRequest'
import { CredentialOfferFactory } from '../credential/offer/credentialOfferFactory'
import { ICredentialRequest } from '@jolocom/protocol-ts/dist/lib/interactionTokens'

@controller('/credential-issuance')
export class CredentialController {
  constructor(
    @inject(TYPES.AppConfig) private readonly appConfig: AppConfig,
    private readonly agentFactory: SdkAgentFactory,
    private readonly requestDescriptionFactory: RequestDescriptionFactory,
    private readonly claimsMetadataProvider: ClaimsMetadataProvider,
    private readonly staticCredentialOfferProvider: StaticCredentialOfferProvider,
    private readonly credentialOfferFactory: CredentialOfferFactory
  ) {}

  /**
   * @openapi
   * /api/v1/credential-issuance/request:
   *   post:
   *     summary: Receive credential issuance request description
   *     tags:
   *       - Credential Issuance
   *     requestBody:
   *       description: Body of the request
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               types:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Returns credential issuance request description.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: The token ID.
   *                 jwt:
   *                   type: string
   *                   description: The token.
   *                 qr:
   *                   type: string
   *                   description: The QR code of the JWT.
   */
  @httpPost('/request')
  public async requestPost(request: Request) {
    // TODO: Validation of credential type availability
    // will be performed by the swagger validator after "Design first" approach implementation
    // TODO: Refactor in favor of strategy pattern usage
    const credentialRequirements: ICredentialRequest[] = request.body.types.map((type: string) => ({
      type: this.claimsMetadataProvider.getByType(type).type
    }))
    const agent = await this.agentFactory.create()
    const token = await agent.credRequestToken({
      credentialRequirements,
      callbackURL: this.appConfig.sdk.callbackUrl,
    })
    const requestDescription = await this.requestDescriptionFactory.create(token)

    return requestDescription.toJSON()
  }

  /**
   * @openapi
   * /api/v1/credential-issuance/offer:
   *   post:
   *     summary: Receive credential issuance offer request description
   *     tags:
   *       - Credential Issuance
   *     requestBody:
   *       description: Body of the request
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               types:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Returns credential issuance offer request description.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: The token ID.
   *                 jwt:
   *                   type: string
   *                   description: The token.
   *                 qr:
   *                   type: string
   *                   description: The QR code of the JWT.
   */
  @httpPost('/offer')
  public async offerPost(request: Request) {
    // TODO: Validation of credential type availability
    // will be performed by the swagger validator after "Design first" approach implementation
    // TODO: Refactor in favor of strategy pattern usage
    const offeredCredentials: CredentialOfferRequest[] = request.body.types.map(
      (type: string) => this.staticCredentialOfferProvider.getByType(type)
    )
    const agent = await this.agentFactory.create()
    const token = await agent.credOfferToken({
      offeredCredentials,
      callbackURL: this.appConfig.sdk.callbackUrl
    })
    const requestDescription = await this.requestDescriptionFactory.create(token)

    return requestDescription.toJSON()
  }

  /**
   * @openapi
   * /api/v1/credential-issuance/offer/custom:
   *   post:
   *     summary: Receive custom credential issuance offer request description
   *     tags:
   *       - Credential Issuance
   *     requestBody:
   *       description: Body of the request
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                 type:
   *                   type: string
   *                 schema:
   *                   type: string
   *                 claims:
   *                   type: object
   *                   additionalProperties:
   *                     type: string
   *                 renderAs:
   *                   type: string
   *                   enum:
   *                     - document
   *                     - permission
   *                     - claim
   *                 display:
   *                   type: object
   *                   properties:
   *                     title:
   *                       required: false
   *                       type: object
   *                       properties:
   *                         path:
   *                           type: array
   *                           required: false
   *                           items:
   *                             type: string
   *                         text:
   *                           type: string
   *                           required: false
   *                         label:
   *                           type: string
   *                           required: false
   *                     subtitle:
   *                       required: false
   *                       type: object
   *                       properties:
   *                         path:
   *                           type: array
   *                           required: false
   *                           items:
   *                             type: string
   *                         text:
   *                           type: string
   *                           required: false
   *                         label:
   *                           type: string
   *                           required: false
   *                     description:
   *                       required: false
   *                       type: object
   *                       properties:
   *                         path:
   *                           type: array
   *                           required: false
   *                           items:
   *                             type: string
   *                         text:
   *                           type: string
   *                           required: false
   *                         label:
   *                           type: string
   *                           required: false
   *                     properties:
   *                       required: false
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           path:
   *                             type: array
   *                             required: false
   *                             items:
   *                               type: string
   *                           text:
   *                             type: string
   *                             required: false
   *                           label:
   *                             type: string
   *                             required: false
   *     responses:
   *       200:
   *         description: Returns custom credential issuance offer request description.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: The token ID.
   *                 jwt:
   *                   type: string
   *                   description: The token.
   *                 qr:
   *                   type: string
   *                   description: The QR code of the JWT.
   */
  @httpPost('/offer/custom')
  public async offerCustomPost(request: Request) {
    // TODO: Validation of the request body
    // will be performed by the swagger validator after "Design first" approach implementation
    // TODO: Refactor in favor of strategy pattern usage
    const offeredCredentials: CredentialOfferRequest[] = request.body.map(
      (offer: CredentialOfferRequest) => this.credentialOfferFactory.create(offer)
    )
    const agent = await this.agentFactory.create()
    const token = await agent.credOfferToken({
      offeredCredentials,
      callbackURL: this.appConfig.sdk.callbackUrl
    })
    const requestDescription = await this.requestDescriptionFactory.create(token)

    return requestDescription.toJSON()
  }
}