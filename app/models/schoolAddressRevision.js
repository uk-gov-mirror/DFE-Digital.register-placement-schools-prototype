const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class SchoolAddressRevision extends Model {
    static associate(models) {
      SchoolAddressRevision.belongsTo(models.SchoolAddress, {
        foreignKey: 'schoolAddressId',
        as: 'schoolAddress'
      })

      SchoolAddressRevision.belongsTo(models.User, {
        foreignKey: 'revisionById',
        as: 'revisionByUser'
      })
    }
  }

  SchoolAddressRevision.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      schoolAddressId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'school_address_id'
      },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'school_id'
      },
      line1: {
        type: DataTypes.STRING,
        field: 'line_1',
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      line2: {
        type: DataTypes.STRING,
        field: 'line_2'
      },
      line3: {
        type: DataTypes.STRING,
        field: 'line_3'
      },
      town: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      county: {
        type: DataTypes.STRING
      },
      postcode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          is: /^(([A-Z]{1,2}[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?[0-9][A-Z]{2}|BFPO ?[0-9]{1,4}|(KY[0-9]|MSR|VG|AI)[ -]?[0-9]{4}|[A-Z]{2} ?[0-9]{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$/
        }
      },
      latitude: {
        type: DataTypes.FLOAT
      },
      longitude: {
        type: DataTypes.FLOAT
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
      modelName: 'SchoolAddressRevision',
      tableName: 'school_address_revisions',
      timestamps: false
    }
  )

  const activityHook = require('../hooks/activityHook')

  SchoolAddressRevision.addHook('afterCreate', (instance, options) =>
    activityHook({
      entityType: 'schoolAddress',
      revisionTable: 'school_address_revisions',
      entityIdField: 'schoolAddressId'
    })(instance, {
      ...options,
      hookName: 'afterCreate'
    })
  )

  return SchoolAddressRevision
}
