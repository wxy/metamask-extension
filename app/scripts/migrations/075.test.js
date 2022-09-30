import { TEST_CHAINS } from '../../../shared/constants/network';
import migration75 from './075';

describe('migration #75', () => {
  it('should update the version metadata', async () => {
    const oldStorage = {
      meta: {
        version: 74,
      },
      data: {},
    };

    const newStorage = await migration75.migrate(oldStorage);
    expect(newStorage.meta).toStrictEqual({
      version: 75,
    });
  });

  it('should update the advancedGasFee object', async () => {
    const oldStorage = {
      meta: {},
      data: {
        PreferencesController: {
          advancedGasFee: {
            maxBaseFee: 10,
            priorityFee: 10,
          },
        },
        NetworkController: {
          provider: {
            chainId: TEST_CHAINS[0],
          },
        },
      },
    };

    const newStorage = await migration75.migrate(oldStorage);
    const newAdvancedGasFee = {
      '0x5': {
        maxBaseFee: 10,
        priorityFee: 10,
      },
    };
    expect(newStorage.data.PreferencesController.advancedGasFee).toStrictEqual(
      newAdvancedGasFee,
    );
  });
});
