/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { SuspenseErrorTest, SuspenseTest } from './components.js'

router.get('/jsx', async ({ jsx }) => jsx.render('JSX works'))

router.get('/suspense', async ({ jsx }) => jsx.stream(SuspenseTest))

router.get('/suspense-error', async ({ jsx }) => jsx.stream(SuspenseErrorTest))
