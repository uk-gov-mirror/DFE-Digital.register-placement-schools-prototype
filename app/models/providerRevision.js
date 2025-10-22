const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class ProviderRevision extends Model {
    static associate(models) {
      ProviderRevision.belongsTo(models.Provider, {
        foreignKey: 'providerId',
        as: 'provider'
      })

      ProviderRevision.belongsTo(models.User, {
        foreignKey: 'revisionById',
        as: 'revisionByUser'
      })
    }
  }

  ProviderRevision.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'provider_id'
      },
      operatingName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'operating_name',
        validate: {
          notEmpty: true
        }
      },
      legalName: {
        type: DataTypes.STRING,
        field: 'legal_name'
      },
      typeCode: {
        type: DataTypes.ENUM('hei', 'other', 'school'),
        field: 'type_code'
      },
      ukprn: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: /^1\d{7}$/
        }
      },
      urn: {
        type: DataTypes.STRING
      },
      accreditedProviderNumber: {
        type: DataTypes.STRING,
        field: 'accredited_provider_number'
      },
      providerCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'provider_code',
        validate: {
          notEmpty: true,
          is: /^[a-zA-Z0-9]{3}$/
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at'
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by_id'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at'
      },
      updatedById: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'updated_by_id'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at'
      },
      deletedById: {
        type: DataTypes.UUID,
        field: 'deleted_by_id'
      },
      revisionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'revision_number'
      },
      revisionAt: {
        type: DataTypes.DATE,
        field: 'revision_at'
      },
      revisionById: {
        type: DataTypes.UUID,
        field: 'revision_by_id'
      }
    },
    {
      sequelize,
      modelName: 'ProviderRevision',
      tableName: 'provider_revisions',
      timestamps: false
    }
  )

  const activityHook = require('../hooks/activityHook')

  ProviderRevision.addHook('afterCreate', (instance, options) =>
    activityHook({
      entityType: 'provider',
      revisionTable: 'provider_revisions',
      entityIdField: 'providerId'
    })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  return ProviderRevision
}
