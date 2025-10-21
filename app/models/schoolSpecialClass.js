const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class SchoolSpecialClass extends Model {
    static associate(models) {
      SchoolSpecialClass.hasMany(models.SchoolDetail, {
        foreignKey: 'specialClassCode',
        sourceKey: 'code',
        as: 'schoolDetails'
      })

      SchoolSpecialClass.belongsTo(models.User, {
        foreignKey: 'createdById',
        as: 'createdByUser'
      })

      SchoolSpecialClass.belongsTo(models.User, {
        foreignKey: 'updatedById',
        as: 'updatedByUser'
      })
    }
  }

  SchoolSpecialClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      code:  {
        type: DataTypes.STRING,
        allowNull: false
      },
      name:  {
        type: DataTypes.STRING,
        allowNull: false
      },
      rank:  {
        type: DataTypes.TINYINT
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
      }
    },
    {
      sequelize,
      modelName: 'SchoolSpecialClass',
      tableName: 'school_special_classes',
      timestamps: true
    }
  )

  // const revisionHook = require('../hooks/revisionHook')

  // SchoolSpecialClass.addHook('afterCreate', (instance, options) =>
  //   revisionHook({ revisionModelName: 'SchoolSpecialClassRevision', modelKey: 'schoolSpecialClass' })(instance, {
  //     ...options,
  //     hookName: 'afterCreate'
  //   })
  // )

  // SchoolSpecialClass.addHook('afterUpdate', (instance, options) => {
  //   const hookName = instance.deletedById !== null ? 'afterDestroy' : 'afterUpdate'
  //   revisionHook({ revisionModelName: 'SchoolSpecialClassRevision', modelKey: 'schoolSpecialClass' })(instance, {
  //     ...options,
  //     hookName
  //   })
  // })

  return SchoolSpecialClass
}
